from datetime import timedelta

import pytest
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import IntegrityError, connection
from django.utils import timezone

from usuarios.models import Usuario
from usuarios.validators import so_digitos, validar_celular, validar_cpf, validar_data_nascimento

pytestmark = pytest.mark.django_db


def test_usuario_e_o_model_de_autenticacao_do_projeto():
    assert get_user_model() is Usuario


def test_create_user_guarda_somente_o_hash_da_senha(usuario, senha):
    assert usuario.password != senha
    assert usuario.check_password(senha)
    with connection.cursor() as cursor:
        cursor.execute("SELECT senha_hash FROM usuarios_usuario WHERE id = %s", [usuario.id])
        assert cursor.fetchone()[0].startswith("bcrypt_sha256$")


def test_create_user_normaliza_email_para_minusculas(db):
    usuario = Usuario.objects.create_user(email="  Maria@Email.COM ", password="x", nome="Maria")
    assert usuario.email == "maria@email.com"


def test_create_user_exige_email(db):
    with pytest.raises(ValueError):
        Usuario.objects.create_user(email="", password="x")


def test_usuario_novo_e_ativo_e_sem_permissoes_de_admin(usuario):
    assert usuario.is_active is True
    assert usuario.is_staff is False
    assert usuario.is_superuser is False


def test_create_superuser_sem_cpf(db):
    admin = Usuario.objects.create_superuser(email="admin@rotae.com", password="x")
    assert admin.is_staff and admin.is_superuser
    assert admin.cpf is None


def test_email_e_unico(usuario):
    with pytest.raises(IntegrityError):
        Usuario.objects.create_user(email="joao@email.com", password="x", nome="Outro")


def test_cpf_e_unico(usuario):
    with pytest.raises(IntegrityError):
        Usuario.objects.create_user(email="outro@email.com", password="x", nome="Outro", cpf="52998224725")


def test_varios_usuarios_sem_cpf_sao_permitidos(db):
    Usuario.objects.create_superuser(email="a@rotae.com", password="x")
    Usuario.objects.create_superuser(email="b@rotae.com", password="x")
    assert Usuario.objects.filter(cpf__isnull=True).count() == 2


def test_so_digitos():
    assert so_digitos("529.982.247-25") == "52998224725"
    assert so_digitos("(85) 99999-0000") == "85999990000"


@pytest.mark.parametrize("cpf", ["52998224725", "11144477735"])
def test_validar_cpf_aceita_cpf_valido(cpf):
    validar_cpf(cpf)


@pytest.mark.parametrize("cpf", ["52998224724", "11111111111", "1234567890", "abcdefghijk"])
def test_validar_cpf_rejeita_cpf_invalido(cpf):
    with pytest.raises(ValidationError):
        validar_cpf(cpf)


@pytest.mark.parametrize("celular", ["8533334444", "85999990000"])
def test_validar_celular_aceita_10_ou_11_digitos(celular):
    validar_celular(celular)


@pytest.mark.parametrize("celular", ["859999", "859999900001", "85-99999-0000"])
def test_validar_celular_rejeita_formato_invalido(celular):
    with pytest.raises(ValidationError):
        validar_celular(celular)


def test_validar_data_nascimento_rejeita_data_futura():
    with pytest.raises(ValidationError):
        validar_data_nascimento(timezone.localdate() + timedelta(days=1))


def test_is_active_e_campo_do_banco_na_coluna_ativo(usuario):
    """O Django filtra is_active no banco (reset de senha, with_perm); não pode ser só property."""
    from django.contrib.auth.forms import PasswordResetForm

    assert list(PasswordResetForm().get_users("joao@email.com")) == [usuario]
    assert Usuario._meta.get_field("is_active").column == "ativo"
    assert Usuario(email="x@x.com", is_active=False).is_active is False


def test_busca_por_email_ignora_maiusculas(usuario):
    assert Usuario.objects.get_by_natural_key("JOAO@Email.com") == usuario
