import pytest
from django.urls import reverse
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken

from usuarios.models import Usuario

pytestmark = pytest.mark.django_db

URL_ME = reverse("me")


def login(api_client, email, senha):
    return api_client.post(reverse("login"), {"email": email, "senha": senha}, format="json").json()


@pytest.fixture
def tokens(api_client, usuario, senha):
    return login(api_client, "joao@email.com", senha)


@pytest.fixture
def cliente_autenticado(api_client, tokens):
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
    return api_client


@pytest.mark.parametrize("metodo", ["get", "patch", "delete"])
def test_me_exige_autenticacao(api_client, metodo):
    resposta = getattr(api_client, metodo)(URL_ME)

    assert resposta.status_code == 401


def test_get_me_devolve_o_usuario_do_token(cliente_autenticado, usuario):
    Usuario.objects.create_user(email="outro@email.com", password="x", nome="Outro", cpf="11144477735")

    resposta = cliente_autenticado.get(URL_ME)

    assert resposta.status_code == 200
    assert resposta.json()["id"] == usuario.id
    assert resposta.json()["cpf"] == "52998224725"
    assert "password" not in resposta.json()


def test_patch_me_atualiza_dados_cadastrais(cliente_autenticado, usuario):
    resposta = cliente_autenticado.patch(URL_ME, {
        "nome": "João Souza",
        "celular": "(85) 98888-7777",
        "dataNasc": "1990-01-31",
        "email": "Joao.Souza@Email.com",
    }, format="json")

    assert resposta.status_code == 200
    corpo = resposta.json()
    assert (corpo["nome"], corpo["celular"], corpo["dataNasc"], corpo["email"]) == (
        "João Souza", "85988887777", "1990-01-31", "joao.souza@email.com",
    )


def test_patch_me_ignora_campos_protegidos(cliente_autenticado, usuario, senha):
    resposta = cliente_autenticado.patch(URL_ME, {
        "cpf": "11144477735",
        "ativo": False,
        "isActive": False,
        "isStaff": True,
        "isSuperuser": True,
        "password": "nova-senha-123",
    }, format="json")

    assert resposta.status_code == 200
    usuario.refresh_from_db()
    assert usuario.cpf == "52998224725"
    assert (usuario.is_active, usuario.is_staff, usuario.is_superuser) == (True, False, False)
    assert usuario.check_password(senha)


def test_patch_me_rejeita_email_de_outro_usuario(cliente_autenticado):
    Usuario.objects.create_user(email="outro@email.com", password="x", nome="Outro")

    resposta = cliente_autenticado.patch(URL_ME, {"email": "OUTRO@email.com"}, format="json")

    assert resposta.status_code == 400
    assert resposta.json()["email"] == ["Já existe um usuário com este e-mail."]


def test_patch_me_aceita_o_proprio_email(cliente_autenticado):
    resposta = cliente_autenticado.patch(URL_ME, {"email": "joao@email.com"}, format="json")

    assert resposta.status_code == 200


def test_put_me_nao_e_permitido(cliente_autenticado):
    resposta = cliente_autenticado.put(URL_ME, {"nome": "X"}, format="json")

    assert resposta.status_code == 405


def test_delete_me_desativa_sem_apagar(cliente_autenticado, usuario):
    resposta = cliente_autenticado.delete(URL_ME)

    assert resposta.status_code == 204
    usuario.refresh_from_db()
    assert usuario.is_active is False


def test_delete_me_revoga_os_refresh_tokens(cliente_autenticado, usuario, tokens):
    cliente_autenticado.delete(URL_ME)

    assert BlacklistedToken.objects.filter(token__user=usuario).exists()


def test_access_token_de_usuario_desativado_e_recusado(cliente_autenticado):
    cliente_autenticado.delete(URL_ME)

    resposta = cliente_autenticado.get(URL_ME)

    assert resposta.status_code == 401


def test_refresh_de_usuario_desativado_e_recusado(cliente_autenticado, api_client, tokens):
    cliente_autenticado.delete(URL_ME)

    api_client.credentials()
    resposta = api_client.post(reverse("refresh_token"), {"refresh": tokens["refresh"]}, format="json")

    assert resposta.status_code == 401


def test_corrida_no_patch_de_email_devolve_400(cliente_autenticado, monkeypatch):
    from rest_framework.validators import UniqueValidator

    Usuario.objects.create_user(email="outro@email.com", password="x", nome="Outro")
    monkeypatch.setattr(UniqueValidator, "__call__", lambda self, value, field: None)

    resposta = cliente_autenticado.patch(URL_ME, {"email": "outro@email.com"}, format="json")

    assert resposta.status_code == 400
    assert resposta.json()["email"] == ["Já existe um usuário com este e-mail."]


def test_patch_me_com_corpo_que_nao_e_objeto_devolve_400(cliente_autenticado):
    resposta = cliente_autenticado.patch(URL_ME, [], format="json")

    assert resposta.status_code == 400


def test_patch_me_ignora_is_active(cliente_autenticado, usuario):
    cliente_autenticado.patch(URL_ME, {"isActive": False}, format="json")

    usuario.refresh_from_db()
    assert usuario.is_active is True
