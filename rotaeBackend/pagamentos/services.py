from django.db import transaction
from django.utils import timezone

from reservas.exceptions import ReservaNaoEncontradaError
from reservas.models import Reserva
from viagens.models import Viagem, ViagemAssento

from .exceptions import PagamentoNaoPermitidoError
from .gateways import obter_gateway
from .models import Pagamento

MAX_TENTATIVAS_PAGAMENTO = 3


def _validar_reserva_pagavel(reserva):
    if reserva.status != Reserva.Status.PAGAMENTO_PENDENTE:
        raise PagamentoNaoPermitidoError(
            f"Reserva não aceita pagamento (status: {reserva.status})."
        )

    agora = timezone.now()
    if reserva.expira_em <= agora:
        raise PagamentoNaoPermitidoError("Reserva expirada.")

    viagem = reserva.viagem
    if viagem.status != Viagem.Status.AGENDADA or viagem.partida_em <= agora:
        raise PagamentoNaoPermitidoError("Viagem indisponível ou já iniciada.")

    total_assentos = reserva.viagem_assentos.count()
    if total_assentos == 0 or reserva.passageiros.count() != total_assentos:
        raise PagamentoNaoPermitidoError(
            "Cadastre os passageiros de todos os assentos antes de pagar."
        )


@transaction.atomic
def processar_pagamento(*, reserva_id, usuario, metodo_pagamento, gateway=None):
    """
    Processa o pagamento de uma reserva do usuário autenticado.
    Bloqueia a reserva e os assentos (ordenados por pk) antes de acionar o gateway.
    APROVADO: reserva -> PAGO e assentos -> RESERVADO.
    NEGADO: registra a tentativa; ao atingir MAX_TENTATIVAS_PAGAMENTO,
    reserva -> FALHA e assentos liberados.
    """
    gateway = gateway or obter_gateway()

    try:
        reserva = (
            Reserva.objects.select_related("viagem")
            .select_for_update(of=("self",))
            .get(pk=reserva_id, usuario=usuario)
        )
    except Reserva.DoesNotExist:
        raise ReservaNaoEncontradaError(
            f"Reserva com id={reserva_id} não encontrada."
        ) from None

    _validar_reserva_pagavel(reserva)

    assentos = list(
        ViagemAssento.objects.select_for_update().filter(reserva=reserva).order_by("pk")
    )

    # Valor sempre vem do servidor, nunca do payload.
    pagamento = Pagamento.objects.create(
        reserva=reserva,
        valor_centavos=reserva.valor_total,
        metodo_pagamento=metodo_pagamento,
        status=Pagamento.Status.PENDENTE,
    )

    resultado = gateway.processar(
        valor_centavos=pagamento.valor_centavos,
        metodo_pagamento=metodo_pagamento,
    )
    pagamento.referencia_externa = resultado.referencia_externa

    if resultado.aprovado:
        pagamento.status = Pagamento.Status.APROVADO
        reserva.status = Reserva.Status.PAGO
        for assento in assentos:
            assento.status = ViagemAssento.Status.RESERVADO
        ViagemAssento.objects.bulk_update(assentos, ["status"])
    else:
        pagamento.status = Pagamento.Status.NEGADO
        tentativas_negadas = reserva.pagamentos.filter(
            status=Pagamento.Status.NEGADO
        ).count()
        # +1: a tentativa atual ainda não foi salva como NEGADO.
        if tentativas_negadas + 1 >= MAX_TENTATIVAS_PAGAMENTO:
            reserva.status = Reserva.Status.FALHA
            for assento in assentos:
                assento.status = ViagemAssento.Status.DISPONIVEL
                assento.reserva = None
            ViagemAssento.objects.bulk_update(assentos, ["status", "reserva"])

    pagamento.save(update_fields=["status", "referencia_externa", "atualizado_em"])
    reserva.save(update_fields=["status", "atualizado_em"])

    return pagamento
