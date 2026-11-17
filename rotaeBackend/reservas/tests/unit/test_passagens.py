from datetime import date

import pytest
from django.db import IntegrityError, transaction

from pagamentos.gateways import GatewaySimulado
from pagamentos.models import Pagamento
from pagamentos.services import MAX_TENTATIVAS_PAGAMENTO, processar_pagamento
from reservas.exceptions import PassageirosAssentosInconsistentesError
from reservas.models import Passageiro, Passagem, Reserva
from reservas.services import cancelar_reserva, criar_reserva, emitir_passagens
from viagens.models import ViagemAssento

pytestmark = pytest.mark.django_db


def criar_reserva_com_passageiros(usuario, viagem):
    assentos = list(
        viagem.viagem_assentos.select_related("assento").order_by("assento__numero")
    )
    reserva = criar_reserva(
        usuario=usuario,
        viagem_id=viagem.id,
        viagem_assento_ids=[assentos[1].id, assentos[0].id],
    )
    primeiro = Passageiro.objects.create(
        reserva=reserva,
        nome="Primeiro Passageiro",
        email="primeiro@email.com",
        celular="85999990000",
        data_nasc=date(1990, 1, 1),
        cpf="11144477735",
    )
    segundo = Passageiro.objects.create(
        reserva=reserva,
        nome="Segundo Passageiro",
        email="segundo@email.com",
        celular="85988880000",
        data_nasc=date(1991, 1, 1),
        cpf="93541134780",
    )
    return reserva, primeiro, segundo


def pagar(reserva, usuario, gateway=GatewaySimulado(aprovar=True)):
    return processar_pagamento(
        reserva_id=reserva.id,
        usuario=usuario,
        metodo_pagamento="PIX",
        gateway=gateway,
    )


def test_pagamento_aprovado_emite_passagens_ordenadas_e_idempotentes(usuario, viagem):
    reserva, primeiro, segundo = criar_reserva_com_passageiros(usuario, viagem)

    pagar(reserva, usuario)

    passagens = list(
        Passagem.objects.filter(reserva=reserva).order_by(
            "viagem_assento__assento__numero"
        )
    )
    assert [passagem.passageiro_id for passagem in passagens] == [
        primeiro.id,
        segundo.id,
    ]
    assert [passagem.viagem_assento.assento.numero for passagem in passagens] == [1, 2]
    assert {passagem.status for passagem in passagens} == {Passagem.Status.CONFIRMADO}

    reserva.refresh_from_db()
    emitir_passagens(reserva=reserva)

    assert Passagem.objects.filter(reserva=reserva).count() == 2


def test_pagamento_negado_ou_reserva_em_falha_nao_emite_passagens(usuario, viagem):
    reserva, _, _ = criar_reserva_com_passageiros(usuario, viagem)

    for _ in range(MAX_TENTATIVAS_PAGAMENTO):
        pagar(reserva, usuario, gateway=GatewaySimulado(aprovar=False))

    reserva.refresh_from_db()
    assert reserva.status == Reserva.Status.FALHA
    assert not Passagem.objects.filter(reserva=reserva).exists()


def test_reserva_cancelada_nao_emite_passagens(usuario, viagem):
    reserva, _, _ = criar_reserva_com_passageiros(usuario, viagem)

    cancelar_reserva(reserva_id=reserva.id, usuario=usuario)
    reserva.refresh_from_db()
    emitir_passagens(reserva=reserva)

    assert reserva.status == Reserva.Status.CANCELADO
    assert not Passagem.objects.filter(reserva=reserva).exists()


def test_emitir_passagens_rejeita_quantidades_inconsistentes(usuario, viagem):
    reserva, _, _ = criar_reserva_com_passageiros(usuario, viagem)
    reserva.status = Reserva.Status.PAGO
    reserva.save(update_fields=["status"])
    Passageiro.objects.filter(reserva=reserva).first().delete()

    with pytest.raises(PassageirosAssentosInconsistentesError):
        emitir_passagens(reserva=reserva)

    assert not Passagem.objects.filter(reserva=reserva).exists()


def test_inconsistencia_na_emissao_preserva_aprovacao_e_reserva_paga(
    usuario, viagem, outra_viagem
):
    reserva, _, _ = criar_reserva_com_passageiros(usuario, viagem)
    Reserva.objects.filter(pk=reserva.pk).update(viagem=outra_viagem)

    with pytest.raises(PassageirosAssentosInconsistentesError):
        pagar(reserva, usuario)

    reserva.refresh_from_db()
    pagamento = reserva.pagamentos.get()
    assert reserva.status == Reserva.Status.PAGO
    assert pagamento.status == Pagamento.Status.APROVADO
    assert set(reserva.viagem_assentos.values_list("status", flat=True)) == {
        ViagemAssento.Status.RESERVADO
    }
    assert not Passagem.objects.filter(reserva=reserva).exists()


def test_cancelamento_durante_falha_de_emissao_preserva_reserva_e_assentos(
    usuario, viagem, monkeypatch
):
    reserva, _, _ = criar_reserva_com_passageiros(usuario, viagem)
    assento_ids = list(reserva.viagem_assentos.values_list("pk", flat=True))

    def cancelar_antes_da_recuperacao(*, pagamento, aprovado, referencia_externa):
        assert aprovado
        cancelar_reserva(reserva_id=reserva.id, usuario=usuario)
        raise PassageirosAssentosInconsistentesError(
            "Reserva paga sem correspondência entre passageiros e assentos."
        )

    monkeypatch.setattr(
        "pagamentos.services._concluir_pagamento", cancelar_antes_da_recuperacao
    )

    with pytest.raises(PassageirosAssentosInconsistentesError):
        pagar(reserva, usuario)

    reserva.refresh_from_db()
    pagamento = reserva.pagamentos.get()
    assentos = list(ViagemAssento.objects.filter(pk__in=assento_ids))
    assert reserva.status == Reserva.Status.CANCELADO
    assert pagamento.status == Pagamento.Status.APROVADO
    assert {assento.status for assento in assentos} == {ViagemAssento.Status.DISPONIVEL}
    assert {assento.reserva_id for assento in assentos} == {None}
    assert not Passagem.objects.filter(reserva=reserva).exists()


def test_constraints_permitem_historico_cancelado_mas_bloqueiam_confirmadas(
    usuario, viagem
):
    reserva, primeiro, segundo = criar_reserva_com_passageiros(usuario, viagem)
    pagar(reserva, usuario)
    passagem = Passagem.objects.get(reserva=reserva, passageiro=primeiro)
    outro_assento = reserva.viagem_assentos.exclude(pk=passagem.viagem_assento_id).get()

    with pytest.raises(IntegrityError), transaction.atomic():
        Passagem.objects.create(
            reserva=reserva,
            passageiro=primeiro,
            viagem_assento=outro_assento,
            status=Passagem.Status.CONFIRMADO,
        )

    with pytest.raises(IntegrityError), transaction.atomic():
        Passagem.objects.create(
            reserva=reserva,
            passageiro=segundo,
            viagem_assento=passagem.viagem_assento,
            status=Passagem.Status.CONFIRMADO,
        )

    Passagem.objects.create(
        reserva=reserva,
        passageiro=primeiro,
        viagem_assento=passagem.viagem_assento,
        status=Passagem.Status.CANCELADO,
    )

    assert (
        Passagem.objects.filter(
            reserva=reserva, status=Passagem.Status.CANCELADO
        ).count()
        == 1
    )
