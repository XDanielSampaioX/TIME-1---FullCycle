from datetime import timedelta

from django.db import transaction
from django.db.models import prefetch_related_objects
from django.utils import timezone

from viagens.models import Viagem, ViagemAssento
from .exceptions import (
    AssentoIndisponivelError,
    AssentoOutraViagemError,
    QuantidadePassageirosError,
    ReservaInvalidaError,
    ReservaNaoEncontradaError,
    ViagemNaoEncontradaError,
)
from .models import Passageiro, Reserva


@transaction.atomic
def criar_reserva(*, usuario, viagem_id, viagem_assento_ids):
    """
    Cria uma reserva dentro de uma transação atômica.
    Bloqueia os assentos com select_for_update() ordenado por PK.
    Se algum assento não estiver disponível ou não pertencer à viagem,
    faz rollback total e levanta AssentoIndisponivelError ou AssentoOutraViagemError.
    """
    try:
        viagem = (
            Viagem.objects
            .disponiveis_para_venda()
            .select_related("origem", "destino", "onibus")
            .get(pk=viagem_id)
        )
    except Viagem.DoesNotExist:
        raise ViagemNaoEncontradaError(f"Viagem com id={viagem_id} não encontrada ou não disponível para venda.")

    ids_unicos = list(dict.fromkeys(viagem_assento_ids))

    # A ordem por pk evita deadlock entre requisições concorrentes
    assentos = list(
        ViagemAssento.objects
        .select_for_update()
        .filter(pk__in=ids_unicos, viagem_id=viagem.pk)
        .order_by("pk")
    )

    if len(assentos) != len(ids_unicos):
        # IDs que não pertencem à viagem - retorna apenas os IDs inválidos
        ids_encontrados = {a.pk for a in assentos}
        ids_invalidos = [i for i in ids_unicos if i not in ids_encontrados]
        raise AssentoOutraViagemError(
            "Um ou mais assentos informados não pertencem à viagem.",
            assentos_indisponiveis=ids_invalidos,
        )

    assentos_indisponiveis = []
    for assento in assentos:
        if assento.status != ViagemAssento.Status.DISPONIVEL or assento.reserva_id is not None:
            assentos_indisponiveis.append(assento.pk)

    if assentos_indisponiveis:
        raise AssentoIndisponivelError(
            "Um ou mais assentos já estão reservados.",
            assentos_indisponiveis=assentos_indisponiveis
        )

    valor_total = viagem.preco_centavos * len(assentos)
    expira_em = timezone.now() + timedelta(hours=24)

    reserva = Reserva.objects.create(
        usuario=usuario,
        viagem=viagem,
        status=Reserva.Status.PAGAMENTO_PENDENTE,
        valor_total=valor_total,
        expira_em=expira_em,
    )

    for assento in assentos:
        assento.status = ViagemAssento.Status.SEGURADO
        assento.reserva = reserva

    ViagemAssento.objects.bulk_update(assentos, ["status", "reserva"])
    prefetch_related_objects([reserva], "viagem_assentos__assento")

    return reserva


def cancelar_reserva(*, reserva_id, usuario):
    """
    Cancela a reserva do usuário autenticado.
    Apenas reservas em PAGAMENTO_PENDENTE podem ser canceladas.
    Altera o status da reserva para CANCELADO e libera os assentos (DISPONIVEL e reserva=None).
    """
    with transaction.atomic():
        try:
            reserva = (
                Reserva.objects
                .select_related("viagem__origem", "viagem__destino", "viagem__onibus")
                .select_for_update(of=("self",))
                .get(pk=reserva_id, usuario=usuario)
            )
        except Reserva.DoesNotExist:
            raise ReservaNaoEncontradaError(f"Reserva com id={reserva_id} não encontrada.")

        if reserva.status != Reserva.Status.PAGAMENTO_PENDENTE:
            raise ReservaInvalidaError(f"Reserva não pode ser cancelada (status: {reserva.status}).")

        reserva.status = Reserva.Status.CANCELADO
        reserva.save(update_fields=["status", "atualizado_em"])

        assentos = list(
            ViagemAssento.objects
            .select_for_update()
            .filter(reserva=reserva)
            .order_by("pk")
        )
        for assento in assentos:
            assento.status = ViagemAssento.Status.DISPONIVEL
            assento.reserva = None

        ViagemAssento.objects.bulk_update(assentos, ["status", "reserva"])

    return reserva


@transaction.atomic
def cadastrar_passageiros(*, reserva_id, usuario, passageiros):
    """
    Cadastra os passageiros de uma reserva do usuário autenticado.
    Exige reserva em PAGAMENTO_PENDENTE, não expirada e ainda sem passageiros,
    com exatamente um passageiro por assento reservado.
    Vincula ao usuário autenticado apenas o passageiro com o CPF dele.
    """
    try:
        reserva = (
            Reserva.objects
            .select_for_update()
            .get(pk=reserva_id, usuario=usuario)
        )
    except Reserva.DoesNotExist:
        raise ReservaNaoEncontradaError(f"Reserva com id={reserva_id} não encontrada.")

    if reserva.status != Reserva.Status.PAGAMENTO_PENDENTE:
        raise ReservaInvalidaError(f"Reserva não aceita passageiros (status: {reserva.status}).")

    if reserva.expira_em <= timezone.now():
        raise ReservaInvalidaError("Reserva expirada.")

    if reserva.passageiros.exists():
        raise ReservaInvalidaError("Reserva já possui passageiros cadastrados.")

    total_assentos = reserva.viagem_assentos.count()
    if len(passageiros) != total_assentos:
        raise QuantidadePassageirosError(
            f"Informe exatamente {total_assentos} passageiro(s), um para cada assento da reserva."
        )

    return Passageiro.objects.bulk_create(
        Passageiro(reserva=reserva, usuario=usuario if dados["cpf"] == usuario.cpf else None, **dados)
        for dados in passageiros
    )