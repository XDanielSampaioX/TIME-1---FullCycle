import pytest
from django.urls import reverse
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken

pytestmark = pytest.mark.django_db

URL_LOGOUT = reverse("logout")
URL_REFRESH = reverse("refresh_token")


@pytest.fixture
def tokens(api_client, usuario, senha):
    return api_client.post(reverse("login"), {"email": "joao@email.com", "senha": senha}, format="json").json()


def test_logout_devolve_204_sem_corpo(api_client, tokens):
    resposta = api_client.post(URL_LOGOUT, {"refresh": tokens["refresh"]}, format="json")

    assert resposta.status_code == 204
    assert not resposta.content


def test_logout_invalida_o_refresh_token(api_client, tokens):
    api_client.post(URL_LOGOUT, {"refresh": tokens["refresh"]}, format="json")

    resposta = api_client.post(URL_REFRESH, {"refresh": tokens["refresh"]}, format="json")

    assert resposta.status_code == 401
    assert BlacklistedToken.objects.filter(token__token=tokens["refresh"]).exists()


def test_logout_nao_derruba_outras_sessoes(api_client, tokens, senha):
    outra_sessao = api_client.post(reverse("login"), {"email": "joao@email.com", "senha": senha}, format="json").json()

    api_client.post(URL_LOGOUT, {"refresh": tokens["refresh"]}, format="json")

    resposta = api_client.post(URL_REFRESH, {"refresh": outra_sessao["refresh"]}, format="json")
    assert resposta.status_code == 200


def test_logout_funciona_com_access_token_expirado_no_cabecalho(api_client, tokens):
    api_client.credentials(HTTP_AUTHORIZATION="Bearer token-expirado")

    resposta = api_client.post(URL_LOGOUT, {"refresh": tokens["refresh"]}, format="json")

    assert resposta.status_code == 204


def test_logout_repetido_e_recusado(api_client, tokens):
    api_client.post(URL_LOGOUT, {"refresh": tokens["refresh"]}, format="json")

    resposta = api_client.post(URL_LOGOUT, {"refresh": tokens["refresh"]}, format="json")

    assert resposta.status_code == 401


@pytest.mark.parametrize("refresh", ["token-invalido", "access"])
def test_logout_recusa_token_que_nao_e_refresh_valido(api_client, tokens, refresh):
    enviado = tokens["access"] if refresh == "access" else refresh

    resposta = api_client.post(URL_LOGOUT, {"refresh": enviado}, format="json")

    assert resposta.status_code == 401


def test_logout_exige_refresh(api_client):
    resposta = api_client.post(URL_LOGOUT, {}, format="json")

    assert resposta.status_code == 400
    assert "refresh" in resposta.json()
