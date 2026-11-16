from datetime import date

import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from pagamentos.gateways import GatewaySimulado
from pagamentos.services import processar_pagamento
from reservas.models import Passageiro
from reservas.services import criar_reserva

pytestmark = pytest.mark.django_db


def criar_passagens(usuario, viagem):
    assentos = list(viagem.viagem_assentos.order_by("assento__numero")[:2])
    reserva = criar_reserva(
        usuario=usuario,
        viagem_id=viagem.id,
        viagem_assento_ids=[assento.id for assento in assentos],
    )
    for indice in range(2):
        Passageiro.objects.create(
            reserva=reserva,
            nome=f"Passageiro {indice + 1}",
            email=f"passageiro{indice + 1}@email.com",
            celular="85999990000",
            data_nasc=date(1990, 1, indice + 1),
            cpf=("11144477735", "93541134780")[indice],
        )
    processar_pagamento(
        reserva_id=reserva.id,
        usuario=usuario,
        metodo_pagamento="PIX",
        gateway=GatewaySimulado(aprovar=True),
    )
    return reserva


def test_listar_minhas_passagens_e_detalhar_reserva_inclui_passagens(
    cliente_autenticado, usuario, viagem
):
    reserva = criar_passagens(usuario, viagem)

    resposta = cliente_autenticado.get(reverse("minhas_passagens"))

    assert resposta.status_code == 200
    data = resposta.json()
    assert data["count"] == 2
    assert len(data["results"]) == 2
    passagem = data["results"][0]
    assert passagem["reservaId"] == reserva.id
    assert passagem["status"] == "CONFIRMADO"
    assert set(passagem["viagemAssento"]) == {"id", "numero"}
    assert passagem["passageiro"]["nome"].startswith("Passageiro")

    detalhe = cliente_autenticado.get(
        reverse("detalhe_reserva", kwargs={"pk": reserva.id})
    )

    assert detalhe.status_code == 200
    assert len(detalhe.json()["passagens"]) == 2


def test_detalhe_passagem_isola_usuario_e_exige_autenticacao(
    cliente_autenticado, outro_cliente, usuario, viagem
):
    reserva = criar_passagens(usuario, viagem)
    passagem_id = reserva.passagens.first().id
    url = reverse("detalhe_passagem", kwargs={"pk": passagem_id})

    assert APIClient().get(url).status_code == 401
    assert outro_cliente.get(url).status_code == 404
    assert cliente_autenticado.get(url).status_code == 200


def test_swagger_documenta_passagens(cliente_autenticado):
    schema = cliente_autenticado.get("/api/schema/", {"format": "json"}).json()

    assert schema["paths"]["/api/v1/me/passagens/"]["get"]["tags"] == ["passagens"]
    assert schema["paths"]["/api/v1/passagens/{id}/"]["get"]["tags"] == ["passagens"]
