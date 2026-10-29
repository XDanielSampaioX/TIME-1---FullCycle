import pytest
from django.urls import reverse

pytestmark = pytest.mark.django_db

URL_LOGIN = reverse("login")
URL_REFRESH = reverse("refresh_token")


def test_login_devolve_tokens_e_usuario(api_client, usuario, senha):
    resposta = api_client.post(URL_LOGIN, {"email": "joao@email.com", "senha": senha}, format="json")

    assert resposta.status_code == 200
    corpo = resposta.json()
    assert corpo["access"] and corpo["refresh"]
    assert corpo["user"]["id"] == usuario.id
    assert corpo["user"]["nome"] == "João da Silva"
    assert corpo["user"]["email"] == "joao@email.com"
    assert "password" not in corpo["user"] and "senhaHash" not in corpo["user"]


def test_login_registra_ultimo_acesso(api_client, usuario, senha):
    api_client.post(URL_LOGIN, {"email": "joao@email.com", "senha": senha}, format="json")

    usuario.refresh_from_db()
    assert usuario.last_login is not None


def test_login_ignora_caixa_e_espacos_do_email(api_client, usuario, senha):
    resposta = api_client.post(URL_LOGIN, {"email": " JOAO@Email.com ", "senha": senha}, format="json")

    assert resposta.status_code == 200


@pytest.mark.parametrize("email, senha_enviada", [
    ("joao@email.com", "senha-errada"),
    ("ninguem@email.com", "Rotae@2026forte"),
])
def test_login_com_credenciais_invalidas(api_client, usuario, email, senha_enviada):
    resposta = api_client.post(URL_LOGIN, {"email": email, "senha": senha_enviada}, format="json")

    assert resposta.status_code == 401
    assert resposta.json()["detail"] == "E-mail ou senha inválidos."


def test_login_de_usuario_desativado_e_recusado(api_client, usuario, senha):
    usuario.is_active = False
    usuario.save()

    resposta = api_client.post(URL_LOGIN, {"email": "joao@email.com", "senha": senha}, format="json")

    assert resposta.status_code == 401


def test_login_exige_email_e_senha(api_client):
    resposta = api_client.post(URL_LOGIN, {}, format="json")

    assert resposta.status_code == 400
    assert {"email", "senha"} <= resposta.json().keys()


def test_login_funciona_com_token_invalido_no_cabecalho(api_client, usuario, senha):
    api_client.credentials(HTTP_AUTHORIZATION="Bearer token-invalido")

    resposta = api_client.post(URL_LOGIN, {"email": "joao@email.com", "senha": senha}, format="json")

    assert resposta.status_code == 200


def test_refresh_devolve_novo_access_e_rotaciona_o_refresh(api_client, usuario, senha):
    tokens = api_client.post(URL_LOGIN, {"email": "joao@email.com", "senha": senha}, format="json").json()

    resposta = api_client.post(URL_REFRESH, {"refresh": tokens["refresh"]}, format="json")

    assert resposta.status_code == 200
    assert resposta.json()["access"]
    assert resposta.json()["refresh"] != tokens["refresh"]
    reuso = api_client.post(URL_REFRESH, {"refresh": tokens["refresh"]}, format="json")
    assert reuso.status_code == 401
