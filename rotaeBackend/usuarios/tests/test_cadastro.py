import pytest
from django.urls import reverse

from usuarios.models import Usuario

pytestmark = pytest.mark.django_db

URL = reverse("cadastro_usuario")


def test_cadastra_usuario_e_devolve_dados_publicos(api_client, dados_usuario, senha):
    resposta = api_client.post(URL, dados_usuario, format="json")

    assert resposta.status_code == 201
    corpo = resposta.json()
    assert set(corpo) == {"id", "nome", "email", "celular", "dataNasc", "cpf", "criadoEm", "atualizadoEm"}
    assert corpo["dataNasc"] == "1995-04-20"
    usuario = Usuario.objects.get(pk=corpo["id"])
    assert usuario.check_password(senha)
    assert usuario.is_active is True


@pytest.mark.parametrize("campo", ["nome", "email", "senha", "celular", "dataNasc", "cpf"])
def test_campos_obrigatorios(api_client, dados_usuario, campo):
    del dados_usuario[campo]

    resposta = api_client.post(URL, dados_usuario, format="json")

    assert resposta.status_code == 400
    assert campo in resposta.json()


def test_aceita_cpf_e_celular_com_mascara_e_grava_so_digitos(api_client, dados_usuario):
    dados_usuario.update(cpf="529.982.247-25", celular="(85) 99999-0000")

    resposta = api_client.post(URL, dados_usuario, format="json")

    assert resposta.status_code == 201
    assert resposta.json()["cpf"] == "52998224725"
    assert resposta.json()["celular"] == "85999990000"


def test_normaliza_email(api_client, dados_usuario):
    dados_usuario["email"] = "  Joao@Email.COM "

    resposta = api_client.post(URL, dados_usuario, format="json")

    assert resposta.status_code == 201
    assert resposta.json()["email"] == "joao@email.com"


def test_rejeita_email_duplicado_mesmo_com_outra_caixa(api_client, dados_usuario, usuario):
    dados_usuario.update(email="JOAO@email.com", cpf="11144477735")

    resposta = api_client.post(URL, dados_usuario, format="json")

    assert resposta.status_code == 400
    assert resposta.json()["email"] == ["Já existe um usuário com este e-mail."]


def test_rejeita_cpf_duplicado_mesmo_com_mascara(api_client, dados_usuario, usuario):
    dados_usuario.update(email="outro@email.com", cpf="529.982.247-25")

    resposta = api_client.post(URL, dados_usuario, format="json")

    assert resposta.status_code == 400
    assert resposta.json()["cpf"] == ["Já existe um usuário com este CPF."]


def test_rejeita_cpf_invalido(api_client, dados_usuario):
    dados_usuario["cpf"] = "52998224724"

    resposta = api_client.post(URL, dados_usuario, format="json")

    assert resposta.status_code == 400
    assert resposta.json()["cpf"] == ["CPF inválido."]


def test_rejeita_celular_invalido(api_client, dados_usuario):
    dados_usuario["celular"] = "8599"

    resposta = api_client.post(URL, dados_usuario, format="json")

    assert resposta.status_code == 400
    assert "celular" in resposta.json()


def test_rejeita_data_de_nascimento_futura(api_client, dados_usuario):
    dados_usuario["dataNasc"] = "2999-01-01"

    resposta = api_client.post(URL, dados_usuario, format="json")

    assert resposta.status_code == 400
    assert "dataNasc" in resposta.json()


@pytest.mark.parametrize("senha_fraca", ["123", "12345678", "joao@email.com"])
def test_rejeita_senha_fraca(api_client, dados_usuario, senha_fraca):
    dados_usuario["senha"] = senha_fraca

    resposta = api_client.post(URL, dados_usuario, format="json")

    assert resposta.status_code == 400
    assert "senha" in resposta.json()


def test_ignora_campos_de_permissao_enviados_pelo_cliente(api_client, dados_usuario):
    dados_usuario.update(isStaff=True, isSuperuser=True, ativo=False, isActive=False)

    resposta = api_client.post(URL, dados_usuario, format="json")

    usuario = Usuario.objects.get(pk=resposta.json()["id"])
    assert (usuario.is_staff, usuario.is_superuser, usuario.is_active) == (False, False, True)


def test_cadastro_funciona_com_token_invalido_no_cabecalho(api_client, dados_usuario):
    api_client.credentials(HTTP_AUTHORIZATION="Bearer token-invalido")

    resposta = api_client.post(URL, dados_usuario, format="json")

    assert resposta.status_code == 201


@pytest.fixture
def sem_validacao_de_unicidade(monkeypatch):
    """Simula a corrida: duas requisições passam pela validação antes de qualquer insert."""
    from rest_framework.validators import UniqueValidator

    monkeypatch.setattr(UniqueValidator, "__call__", lambda self, value, field: None)


@pytest.mark.parametrize("campo, valor, mensagem", [
    ("email", "joao@email.com", "Já existe um usuário com este e-mail."),
    ("cpf", "52998224725", "Já existe um usuário com este CPF."),
])
def test_corrida_no_cadastro_devolve_400_e_nao_500(
    api_client, dados_usuario, usuario, sem_validacao_de_unicidade, campo, valor, mensagem,
):
    dados_usuario.update(email="novo@email.com", cpf="11144477735")
    dados_usuario[campo] = valor

    resposta = api_client.post(URL, dados_usuario, format="json")

    assert resposta.status_code == 400
    assert resposta.json()[campo] == [mensagem]


@pytest.mark.parametrize("corpo", [[], "abc"])
def test_corpo_que_nao_e_objeto_devolve_400(api_client, corpo):
    resposta = api_client.post(URL, corpo, format="json")

    assert resposta.status_code == 400
