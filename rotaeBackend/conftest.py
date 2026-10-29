import pytest


@pytest.fixture(autouse=True)
def use_fast_password_hasher(settings):
    """
    Injeta hasher ultrarrápido em memória apenas durante a execução dos testes.
    """
    settings.PASSWORD_HASHERS = [
        "django.contrib.auth.hashers.MD5PasswordHasher",
    ]
