from django.db import transaction
from django.utils import timezone

from reservas.exceptions import ReservaNaoEncontradaError
from reservas.models import Reserva
from viagens.models import Viagem, ViagemAssento

from .exceptions import GatewayIndisponivelError, PagamentoNaoPermitidoError
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

    # valor_total é PositiveIntegerField (aceita 0), mas o pagamento exige > 0.
    if reserva.valor_total <= 0:
        raise PagamentoNaoPermitidoError("Reserva sem valor a pagar.")

    viagem = reserva.viagem
    if viagem.status != Viagem.Status.AGENDADA or viagem.partida_em <= agora:
        raise PagamentoNaoPermitidoError("Viagem indisponível ou já iniciada.")

    total_assentos = reserva.viagem_assentos.count()
    if total_assentos == 0 or reserva.passageiros.count() != total_assentos:
        raise PagamentoNaoPermitidoError(
            "Cadastre os passageiros de todos os assentos antes de pagar."
        )

    if reserva.pagamentos.filter(status=Pagamento.Status.PENDENTE).exists():
        raise PagamentoNaoPermitidoError(
            "Já existe um pagamento em processamento para esta reserva."
        )


@transaction.atomic
def _iniciar_pagamento(*, reserva_id, usuario, metodo_pagamento):
    """Transação 1: bloqueia a reserva, valida e registra o pagamento PENDENTE."""
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

    # Valor sempre vem do servidor, nunca do payload.
    return Pagamento.objects.create(
        reserva=reserva,
        valor_centavos=reserva.valor_total,
        metodo_pagamento=metodo_pagamento,
        status=Pagamento.Status.PENDENTE,
    )


def _atualizar_assentos(reserva_alvo, /, **campos):
    # Mesma ordem de lock (por pk) das demais operações, para evitar deadlock.
    assentos = list(
        ViagemAssento.objects.select_for_update()
        .filter(reserva=reserva_alvo)
        .order_by("pk")
    )
    for assento in assentos:
        for campo, valor in campos.items():
            setattr(assento, campo, valor)
    ViagemAssento.objects.bulk_update(assentos, list(campos))


@transaction.atomic
def _concluir_pagamento(*, pagamento, aprovado, referencia_externa):
    """
    Transação 2: aplica o resultado do gateway.
    APROVADO: reserva -> PAGO e assentos -> RESERVADO.
    NEGADO: só atualiza o pagamento; ao atingir MAX_TENTATIVAS_PAGAMENTO,
    reserva -> FALHA e assentos liberados.
    Retorna (pagamento, aplicado). `aplicado` é False se a reserva deixou de estar
    pendente enquanto o gateway respondia; nesse caso o pagamento é registrado
    como NEGADO e nada é confirmado.
    """
    reserva = Reserva.objects.select_for_update().get(pk=pagamento.reserva_id)
    pagamento = Pagamento.objects.select_for_update().get(pk=pagamento.pk)
    pagamento.reserva = reserva
    pagamento.referencia_externa = referencia_externa

    reserva_pendente = reserva.status == Reserva.Status.PAGAMENTO_PENDENTE
    pagamento.status = (
        Pagamento.Status.APROVADO
        if aprovado and reserva_pendente
        else Pagamento.Status.NEGADO
    )
    pagamento.save(update_fields=["status", "referencia_externa", "atualizado_em"])

    if not reserva_pendente:
        return pagamento, False

    if pagamento.status == Pagamento.Status.APROVADO:
        reserva.status = Reserva.Status.PAGO
        _atualizar_assentos(reserva, status=ViagemAssento.Status.RESERVADO)
        reserva.save(update_fields=["status", "atualizado_em"])
    elif (
        reserva.pagamentos.filter(status=Pagamento.Status.NEGADO).count()
        >= MAX_TENTATIVAS_PAGAMENTO
    ):
        reserva.status = Reserva.Status.FALHA
        _atualizar_assentos(
            reserva, status=ViagemAssento.Status.DISPONIVEL, reserva=None
        )
        reserva.save(update_fields=["status", "atualizado_em"])
    # Recusa abaixo do limite: a reserva segue PAGAMENTO_PENDENTE, sem UPDATE.

    return pagamento, True


def processar_pagamento(*, reserva_id, usuario, metodo_pagamento, gateway=None):
    """
    Processa o pagamento de uma reserva do usuário autenticado em 3 etapas,
    para não segurar locks do banco enquanto o gateway responde:
    1. transação curta que valida e registra o pagamento PENDENTE;
    2. chamada ao gateway, fora de transação;
    3. transação curta que aplica o resultado na reserva e nos assentos.
    """
    gateway = gateway or obter_gateway()

    pagamento = _iniciar_pagamento(
        reserva_id=reserva_id, usuario=usuario, metodo_pagamento=metodo_pagamento
    )

    try:
        resultado = gateway.processar(
            valor_centavos=pagamento.valor_centavos,
            metodo_pagamento=metodo_pagamento,
        )
    except Exception as erro:
        # Sem resposta do provedor a tentativa conta como recusada; assim o
        # pagamento não fica PENDENTE para sempre bloqueando novas tentativas.
        _concluir_pagamento(pagamento=pagamento, aprovado=False, referencia_externa="")
        raise GatewayIndisponivelError(
            "Provedor de pagamento indisponível. Tente novamente."
        ) from erro

    pagamento, aplicado = _concluir_pagamento(
        pagamento=pagamento,
        aprovado=resultado.aprovado,
        referencia_externa=resultado.referencia_externa,
    )
    if not aplicado:
        raise PagamentoNaoPermitidoError(
            "Reserva mudou de status durante o pagamento "
            f"(status: {pagamento.reserva.status})."
        )
    return pagamento
