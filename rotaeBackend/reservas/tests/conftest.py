from datetime import datetime, timedelta

import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from usuarios.models import Usuario
from viagens.models import Cidade, Onibus, Viagem
from viagens.services import gerar_assentos_da_viagem

SENHA = "Rotae@2026forte"


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def usuario(db):
    return Usuario.objects.create_user(
        email="joao@email.com",
        password=SENHA,
        nome="João da Silva",
        celular="85999990000",
        data_nasc="1995-04-20",
        cpf="52998224725",
    )


@pytest.fixture
def outro_usuario(db):
    return Usuario.objects.create_user(
        email="maria@email.com",
        password=SENHA,
        nome="Maria de Sousa",
        celular="85988880000",
        data_nasc="1996-05-15",
        cpf="12345678901",
    )


@pytest.fixture
def token(api_client, usuario):
    url = reverse("login")
    resposta = api_client.post(url, {"email": "joao@email.com", "senha": SENHA}, format="json")
    return resposta.json()["access"]


@pytest.fixture
def outro_token(api_client, outro_usuario):
    url = reverse("login")
    resposta = api_client.post(url, {"email": "maria@email.com", "senha": SENHA}, format="json")
    return resposta.json()["access"]


@pytest.fixture
def autenticar(api_client, token):
    def _autenticar():
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return _autenticar


@pytest.fixture
def autenticar_outro(api_client, outro_token):
    def _autenticar_outro():
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {outro_token}")
    return _autenticar_outro


def amanha_as(hora, minuto=0):
    amanha = timezone.localdate() + timedelta(days=1)
    return timezone.make_aware(
        datetime.combine(amanha, datetime.min.time()).replace(hour=hora, minute=minuto)
    )


@pytest.fixture
def fortaleza(db):
    return Cidade.objects.create(nome="Fortaleza", uf="CE")


@pytest.fixture
def sobral(db):
    return Cidade.objects.create(nome="Sobral", uf="CE")


@pytest.fixture
def onibus(db):
    return Onibus.objects.create(identificacao="RT-001", total_assentos=4, modelo="Marcopolo G8")


@pytest.fixture
def viagem(fortaleza, sobral, onibus):
    v = Viagem.objects.create(
        onibus=onibus,
        origem=fortaleza,
        destino=sobral,
        classe=Viagem.Classe.CONVENCIONAL,
        partida_em=amanha_as(8),
        chegada_em=amanha_as(12),
        preco_centavos=8990,
        status=Viagem.Status.AGENDADA,
    )
    gerar_assentos_da_viagem(v)
    return v


@pytest.fixture
def outra_viagem(fortaleza, sobral, onibus):
    v = Viagem.objects.create(
        onibus=onibus,
        origem=fortaleza,
        destino=sobral,
        classe=Viagem.Classe.CONVENCIONAL,
        partida_em=amanha_as(14),
        chegada_em=amanha_as(18),
        preco_centavos=7500,
        status=Viagem.Status.AGENDADA,
    )
    gerar_assentos_da_viagem(v)
    return v
