import pytest
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.urls import reverse

from viagens.models import Onibus, Viagem

from .conftest import amanha_as

pytestmark = pytest.mark.django_db


@pytest.fixture
def admin_client(client):
    usuario = get_user_model().objects.create_superuser("admin", "admin@rotae.com", "senha-forte-123")
    client.force_login(usuario)
    return client


def test_cadastrar_onibus_no_admin_cria_os_assentos(admin_client):
    resposta = admin_client.post(reverse("admin:viagens_onibus_add"), {
        "identificacao": "RT-010",
        "total_assentos": 3,
        "modelo": "Marcopolo",
        "assentos-TOTAL_FORMS": 0,
        "assentos-INITIAL_FORMS": 0,
    })

    assert resposta.status_code == 302
    assert Onibus.objects.get(identificacao="RT-010").assentos.count() == 3


def test_cadastrar_viagem_no_admin_gera_assentos_disponiveis(admin_client, onibus, fortaleza, sobral):
    resposta = admin_client.post(reverse("admin:viagens_viagem_add"), {
        "onibus": onibus.id,
        "origem": fortaleza.id,
        "destino": sobral.id,
        "classe": Viagem.Classe.CONVENCIONAL,
        "partida_em_0": amanha_as(8).strftime("%d/%m/%Y"),
        "partida_em_1": "08:00:00",
        "chegada_em_0": amanha_as(12).strftime("%d/%m/%Y"),
        "chegada_em_1": "12:00:00",
        "preco_centavos": 8990,
        "status": Viagem.Status.AGENDADA,
        "viagem_assentos-TOTAL_FORMS": 0,
        "viagem_assentos-INITIAL_FORMS": 0,
    })

    assert resposta.status_code == 302
    viagem = Viagem.objects.get()
    assert viagem.viagem_assentos.filter(status="DISPONIVEL").count() == onibus.total_assentos


def test_paginas_do_admin_abrem(admin_client, criar_viagem):
    viagem = criar_viagem()

    for url in (
        reverse("admin:viagens_viagem_changelist"),
        reverse("admin:viagens_viagem_change", args=[viagem.id]),
        reverse("admin:viagens_onibus_changelist"),
        reverse("admin:viagens_viagemassento_changelist"),
    ):
        assert admin_client.get(url).status_code == 200


def test_popular_viagens_e_idempotente(db):
    call_command("popular_viagens", dias=2)
    call_command("popular_viagens", dias=2)

    assert Viagem.objects.count() == 10
    for viagem in Viagem.objects.select_related("onibus"):
        assert viagem.viagem_assentos.count() == viagem.onibus.total_assentos
