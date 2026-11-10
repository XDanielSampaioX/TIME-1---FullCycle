from datetime import timedelta

import pytest
from django.db import IntegrityError
from django.utils import timezone

from pagamentos.exceptions import PagamentoNaoPermitidoError
from pagamentos.gateways import GatewaySimulado
from pagamentos.models import Pagamento
from pagamentos.services import MAX_TENTATIVAS_PAGAMENTO, processar_pagamento
from reservas.exceptions import ReservaNaoEncontradaError
from reservas.models import Reserva
from viagens.models import Viagem, ViagemAssento

pytestmark = pytest.mark.django_db

APROVA = GatewaySimulado(aprovar=True)
NEGA = GatewaySimulado(aprovar=False)


def pagar(reserva, usuario, gateway=APROVA, metodo="PIX"):
    return processar_pagamento(
        reserva_id=reserva.id,
        usuario=usuario,
        metodo_pagamento=metodo,
        gateway=gateway,
    )


def status_dos_assentos(reserva_id):
    return set(
        ViagemAssento.objects.filter(reserva_id=reserva_id).values_list(
            "status", flat=True
        )
    )


# --- Gateway simulado ---


def test_gateway_simulado_gera_referencia_condizente_com_metodo():
    resultado = GatewaySimulado().processar(valor_centavos=100, metodo_pagamento="PIX")
    assert resultado.aprovado is True
    assert resultado.referencia_externa.startswith("SIM-PIX-")

    resultado = NEGA.processar(valor_centavos=100, metodo_pagamento="CARTAO")
    assert resultado.aprovado is False
    assert resultado.referencia_externa.startswith("SIM-CARTAO-")


# --- Aprovação ---


def test_pagamento_aprovado_confirma_reserva_e_assentos(reserva, usuario):
    pagamento = pagar(reserva, usuario)

    assert pagamento.status == Pagamento.Status.APROVADO
    assert pagamento.valor_centavos == reserva.valor_total
    assert pagamento.referencia_externa.startswith("SIM-PIX-")

    reserva.refresh_from_db()
    assert reserva.status == Reserva.Status.PAGO
    assert status_dos_assentos(reserva.id) == {ViagemAssento.Status.RESERVADO}


def test_nao_permite_pagar_reserva_ja_paga(reserva, usuario):
    pagar(reserva, usuario)

    with pytest.raises(PagamentoNaoPermitidoError):
        pagar(reserva, usuario)

    assert reserva.pagamentos.filter(status=Pagamento.Status.APROVADO).count() == 1


def test_banco_impede_dois_pagamentos_aprovados_na_mesma_reserva(reserva, usuario):
    pagar(reserva, usuario)

    with pytest.raises(IntegrityError):
        Pagamento.objects.create(
            reserva=reserva,
            valor_centavos=reserva.valor_total,
            metodo_pagamento="PIX",
            status=Pagamento.Status.APROVADO,
        )


# --- Recusa e retentativa ---


def test_pagamento_negado_registra_tentativa_e_mantem_reserva_pendente(
    reserva, usuario
):
    pagamento = pagar(reserva, usuario, gateway=NEGA)

    assert pagamento.status == Pagamento.Status.NEGADO
    assert Pagamento.objects.filter(pk=pagamento.pk).exists()

    reserva.refresh_from_db()
    assert reserva.status == Reserva.Status.PAGAMENTO_PENDENTE
    assert status_dos_assentos(reserva.id) == {ViagemAssento.Status.SEGURADO}


def test_retentativa_apos_recusa_pode_ser_aprovada(reserva, usuario):
    pagar(reserva, usuario, gateway=NEGA)
    pagamento = pagar(reserva, usuario, metodo="CARTAO")

    assert pagamento.status == Pagamento.Status.APROVADO
    reserva.refresh_from_db()
    assert reserva.status == Reserva.Status.PAGO
    assert reserva.pagamentos.count() == 2


def test_esgotar_tentativas_marca_falha_e_libera_assentos(reserva, usuario):
    ids_assentos = list(reserva.viagem_assentos.values_list("id", flat=True))

    for _ in range(MAX_TENTATIVAS_PAGAMENTO):
        pagar(reserva, usuario, gateway=NEGA)

    reserva.refresh_from_db()
    assert reserva.status == Reserva.Status.FALHA
    assert reserva.pagamentos.filter(status=Pagamento.Status.NEGADO).count() == (
        MAX_TENTATIVAS_PAGAMENTO
    )
    assentos = ViagemAssento.objects.filter(id__in=ids_assentos)
    assert {a.status for a in assentos} == {ViagemAssento.Status.DISPONIVEL}
    assert {a.reserva_id for a in assentos} == {None}

    with pytest.raises(PagamentoNaoPermitidoError):
        pagar(reserva, usuario)


# --- Pré-condições ---


def test_reserva_de_outro_usuario_nao_encontrada(reserva, outro_usuario):
    with pytest.raises(ReservaNaoEncontradaError):
        pagar(reserva, outro_usuario)


@pytest.mark.parametrize(
    "status",
    [Reserva.Status.CANCELADO, Reserva.Status.EXPIRADO, Reserva.Status.FALHA],
)
def test_nao_permite_pagar_reserva_com_status_invalido(reserva, usuario, status):
    Reserva.objects.filter(pk=reserva.pk).update(status=status)

    with pytest.raises(PagamentoNaoPermitidoError):
        pagar(reserva, usuario)

    assert not reserva.pagamentos.exists()


def test_nao_permite_pagar_reserva_expirada(reserva, usuario):
    Reserva.objects.filter(pk=reserva.pk).update(
        expira_em=timezone.now() - timedelta(minutes=1)
    )

    with pytest.raises(PagamentoNaoPermitidoError, match="expirada"):
        pagar(reserva, usuario)


def test_nao_permite_pagar_sem_passageiros(reserva_sem_passageiros, usuario):
    with pytest.raises(PagamentoNaoPermitidoError, match="passageiros"):
        pagar(reserva_sem_passageiros, usuario)


def test_nao_permite_pagar_viagem_cancelada(reserva, usuario, viagem):
    Viagem.objects.filter(pk=viagem.pk).update(status=Viagem.Status.CANCELADA)

    with pytest.raises(PagamentoNaoPermitidoError, match="Viagem"):
        pagar(reserva, usuario)


def test_nao_permite_pagar_viagem_ja_iniciada(reserva, usuario, viagem):
    Viagem.objects.filter(pk=viagem.pk).update(
        partida_em=timezone.now() - timedelta(minutes=1)
    )

    with pytest.raises(PagamentoNaoPermitidoError, match="Viagem"):
        pagar(reserva, usuario)
