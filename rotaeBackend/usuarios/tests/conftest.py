import pytest
from rest_framework_simplejwt.tokens import RefreshToken


@pytest.fixture
def dados_usuario(senha):
    """Dados válidos de cadastro, já no formato camelCase enviado pelo frontend."""
    return {
        "nome": "João da Silva",
        "email": "joao@email.com",
        "senha": senha,
        "celular": "85999990000",
        "dataNasc": "1995-04-20",
        "cpf": "52998224725",
    }


@pytest.fixture
def tokens(usuario):
    """Dicionário com tokens access e refresh para testes de ciclo de vida do JWT (logout/refresh)."""
    refresh = RefreshToken.for_user(usuario)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }
