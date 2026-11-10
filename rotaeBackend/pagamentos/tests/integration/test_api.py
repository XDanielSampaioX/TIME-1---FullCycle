import pytest
from django.urls import reverse

from pagamentos.gateways import GatewaySimulado
from pagamentos.models import Pagamento
from reservas.models import Reserva
from viagens.models import ViagemAssento

pytestmark = pytest.mark.django_db


def url_pagar(reserva_id):
    return reverse("criar_pagamento", kwargs={"pk": reserva_id})


def test_pagar_reserva_aprovado(cliente_autenticado, reserva):
    resposta = cliente_autenticado.post(
        url_pagar(reserva.id), {"metodoPagamento": "PIX"}, format="json"
    )

    assert resposta.status_code == 201
    data = resposta.json()
    assert data["status"] == "APROVADO"
    assert data["reservaId"] == reserva.id
    assert data["reservaStatus"] == "PAGO"
    assert data["metodoPagamento"] == "PIX"
    assert data["valorCentavos"] == reserva.valor_total
    assert data["referenciaExterna"].startswith("SIM-PIX-")

    reserva.refresh_from_db()
    assert reserva.status == Reserva.Status.PAGO
    assert set(reserva.viagem_assentos.values_list("status", flat=True)) == {
        ViagemAssento.Status.RESERVADO
    }


def test_valor_do_payload_e_ignorado(cliente_autenticado, reserva):
    resposta = cliente_autenticado.post(
        url_pagar(reserva.id),
        {"metodoPagamento": "CARTAO", "valorCentavos": 1},
        format="json",
    )

    assert resposta.status_code == 201
    assert resposta.json()["valorCentavos"] == reserva.valor_total


def test_pagar_reserva_negado_retorna_201_com_status_negado(
    cliente_autenticado, reserva, monkeypatch
):
    monkeypatch.setattr(
        "pagamentos.services.obter_gateway", lambda: GatewaySimulado(aprovar=False)
    )

    resposta = cliente_autenticado.post(
        url_pagar(reserva.id), {"metodoPagamento": "PIX"}, format="json"
    )

    assert resposta.status_code == 201
    assert resposta.json()["status"] == "NEGADO"
    assert resposta.json()["reservaStatus"] == "PAGAMENTO_PENDENTE"
    assert Pagamento.objects.filter(
        reserva=reserva, status=Pagamento.Status.NEGADO
    ).exists()


@pytest.mark.parametrize("payload", [{}, {"metodoPagamento": "BOLETO"}])
def test_metodo_pagamento_invalido_retorna_400(cliente_autenticado, reserva, payload):
    resposta = cliente_autenticado.post(url_pagar(reserva.id), payload, format="json")

    assert resposta.status_code == 400
    assert not reserva.pagamentos.exists()


def test_anonimo_recebe_401(api_client, reserva):
    resposta = api_client.post(
        url_pagar(reserva.id), {"metodoPagamento": "PIX"}, format="json"
    )

    assert resposta.status_code == 401


def test_reserva_de_outro_usuario_retorna_404(outro_cliente, reserva):
    resposta = outro_cliente.post(
        url_pagar(reserva.id), {"metodoPagamento": "PIX"}, format="json"
    )

    assert resposta.status_code == 404
    assert not reserva.pagamentos.exists()


def test_reserva_inexistente_retorna_404(cliente_autenticado):
    resposta = cliente_autenticado.post(
        url_pagar(999999), {"metodoPagamento": "PIX"}, format="json"
    )

    assert resposta.status_code == 404


def test_pagar_reserva_ja_paga_retorna_409(cliente_autenticado, reserva):
    cliente_autenticado.post(
        url_pagar(reserva.id), {"metodoPagamento": "PIX"}, format="json"
    )

    resposta = cliente_autenticado.post(
        url_pagar(reserva.id), {"metodoPagamento": "PIX"}, format="json"
    )

    assert resposta.status_code == 409
    assert reserva.pagamentos.count() == 1


def test_pagar_sem_passageiros_retorna_409(
    cliente_autenticado, reserva_sem_passageiros
):
    resposta = cliente_autenticado.post(
        url_pagar(reserva_sem_passageiros.id),
        {"metodoPagamento": "PIX"},
        format="json",
    )

    assert resposta.status_code == 409


def test_gateway_indisponivel_retorna_502(cliente_autenticado, reserva, monkeypatch):
    def gateway_com_erro(**kwargs):
        raise ConnectionError("timeout")

    monkeypatch.setattr(
        GatewaySimulado, "processar", lambda self, **kw: gateway_com_erro()
    )

    resposta = cliente_autenticado.post(
        url_pagar(reserva.id), {"metodoPagamento": "PIX"}, format="json"
    )

    assert resposta.status_code == 502
    assert reserva.pagamentos.get().status == Pagamento.Status.NEGADO


def test_swagger_usa_pk_no_path_de_pagamentos(api_client):
    schema = api_client.get("/api/schema/", {"format": "json"}).json()

    operacao = schema["paths"]["/api/v1/reservas/{id}/pagamentos/"]["post"]
    assert [p["name"] for p in operacao["parameters"] if p["in"] == "path"] == ["id"]
