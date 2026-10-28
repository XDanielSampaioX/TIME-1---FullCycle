import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from usuarios.models import Usuario

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