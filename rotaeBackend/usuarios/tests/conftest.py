from datetime import date

import pytest
from rest_framework.test import APIClient

from usuarios.models import Usuario

SENHA = "Rotae@2026forte"


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def senha():
    return SENHA


@pytest.fixture
def dados_usuario():
    """Dados válidos de cadastro, já no formato camelCase enviado pelo frontend."""
    return {
        "nome": "João da Silva",
        "email": "joao@email.com",
        "senha": SENHA,
        "celular": "85999990000",
        "dataNasc": "1995-04-20",
        "cpf": "52998224725",
    }


@pytest.fixture
def usuario(db):
    return Usuario.objects.create_user(
        email="joao@email.com",
        password=SENHA,
        nome="João da Silva",
        celular="85999990000",
        data_nasc=date(1995, 4, 20),
        cpf="52998224725",
    )
