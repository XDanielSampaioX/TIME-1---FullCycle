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
def token(api_client, usuario):
    url = reverse("login")
    resposta = api_client.post(url, {"email": "joao@email.com", "senha": SENHA}, format="json")
    return resposta.json()["access"]


@pytest.fixture
def autenticar(api_client, token):
    def _autenticar():
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return _autenticar