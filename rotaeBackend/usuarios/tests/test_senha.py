import pytest
from django.urls import reverse

pytestmark = pytest.mark.django_db

URL = reverse("alterar_senha")
NOVA = "Outra@Senha2027"


def login(api_client, email, senha):
    return api_client.post(reverse("login"), {"email": email, "senha": senha}, format="json")


@pytest.fixture
def cliente_autenticado(api_client, usuario, senha):
    access = login(api_client, "joao@email.com", senha).json()["access"]
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    return api_client


def trocar_senha(cliente, senha_atual):
    return cliente.post(URL, {
        "senhaAtual": senha_atual, "novaSenha": NOVA, "confirmacaoNovaSenha": NOVA,
    }, format="json")


def test_altera_a_senha(cliente_autenticado, api_client, usuario, senha):
    resposta = trocar_senha(cliente_autenticado, senha)

    assert resposta.status_code == 200
    api_client.credentials()
    assert login(api_client, "joao@email.com", NOVA).status_code == 200
    assert login(api_client, "joao@email.com", senha).status_code == 401


def test_troca_de_senha_derruba_as_outras_sessoes(cliente_autenticado, usuario, senha):
    from rest_framework.test import APIClient

    outra_sessao = login(APIClient(), "joao@email.com", senha).json()

    trocar_senha(cliente_autenticado, senha)

    outro_cliente = APIClient()
    outro_cliente.credentials(HTTP_AUTHORIZATION=f"Bearer {outra_sessao['access']}")
    assert outro_cliente.get(reverse("me")).status_code == 401
    refresh = APIClient().post(reverse("refresh_token"), {"refresh": outra_sessao["refresh"]}, format="json")
    assert refresh.status_code == 401


def test_troca_de_senha_devolve_tokens_novos_para_a_sessao_atual(cliente_autenticado, senha):
    tokens = trocar_senha(cliente_autenticado, senha).json()

    assert cliente_autenticado.get(reverse("me")).status_code == 401
    cliente_autenticado.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
    assert cliente_autenticado.get(reverse("me")).status_code == 200
    cliente_autenticado.credentials()
    refresh = cliente_autenticado.post(reverse("refresh_token"), {"refresh": tokens["refresh"]}, format="json")
    assert refresh.status_code == 200


def test_exige_autenticacao(api_client):
    assert api_client.post(URL, {}, format="json").status_code == 401


def test_rejeita_senha_atual_errada(cliente_autenticado):
    resposta = cliente_autenticado.post(URL, {
        "senhaAtual": "errada", "novaSenha": NOVA, "confirmacaoNovaSenha": NOVA,
    }, format="json")

    assert resposta.status_code == 400
    assert resposta.json()["senhaAtual"] == ["Senha atual incorreta."]


def test_rejeita_confirmacao_diferente(cliente_autenticado, senha):
    resposta = cliente_autenticado.post(URL, {
        "senhaAtual": senha, "novaSenha": NOVA, "confirmacaoNovaSenha": NOVA + "x",
    }, format="json")

    assert resposta.status_code == 400
    assert resposta.json()["confirmacaoNovaSenha"] == ["A confirmação não confere com a nova senha."]


def test_rejeita_nova_senha_fraca(cliente_autenticado, senha):
    resposta = cliente_autenticado.post(URL, {
        "senhaAtual": senha, "novaSenha": "12345678", "confirmacaoNovaSenha": "12345678",
    }, format="json")

    assert resposta.status_code == 400
    assert "novaSenha" in resposta.json()
