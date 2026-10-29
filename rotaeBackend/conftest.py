import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

SENHA = "Rotae@2026forte"


@pytest.fixture(autouse=True)
def use_fast_password_hasher(settings):
    """
    Injeta hasher ultrarrápido em memória apenas durante a execução dos testes.
    """
    settings.PASSWORD_HASHERS = [
        "django.contrib.auth.hashers.MD5PasswordHasher",
    ]


@pytest.fixture
def api_client():
    """Cliente de teste do DRF disponível para todas as apps."""
    return APIClient()


@pytest.fixture
def senha():
    """Senha padrão utilizada nos testes de autenticação."""
    return SENHA


@pytest.fixture
def usuario(db):
    """Usuário padrão cadastrado e ativo no banco para testes entre apps."""
    from datetime import date
    from usuarios.models import Usuario

    return Usuario.objects.create_user(
        email="joao@email.com",
        password=SENHA,
        nome="João da Silva",
        celular="85999990000",
        data_nasc=date(1995, 4, 20),
        cpf="52998224725",
    )


@pytest.fixture
def token(usuario):
    """String do access token JWT emitido diretamente em memória."""
    return str(RefreshToken.for_user(usuario).access_token)


@pytest.fixture
def cliente_autenticado(api_client, token):
    """Cliente de teste pré-autenticado com o token do usuário padrão."""
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return api_client


def pytest_collection_modifyitems(items):
    """
    Marca automaticamente testes com 'unit' ou 'integration' conforme
    o diretório onde estão localizados (tests/unit/ ou tests/integration/).
    Garante que nenhum teste fique sem marcador (órfão).
    """
    for item in items:
        test_path = str(getattr(item, "path", item.fspath))
        if "/unit/" in test_path:
            item.add_marker(pytest.mark.unit)
        elif "/integration/" in test_path:
            item.add_marker(pytest.mark.integration)
        else:
            pytest.fail(
                f"Teste órfão detectado: {item.nodeid}. "
                "Todo teste deve estar dentro de 'tests/unit/' ou 'tests/integration/'."
            )
