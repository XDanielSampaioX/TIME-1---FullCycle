import pytest
from django.urls import reverse

from usuarios.models import Usuario

pytestmark = pytest.mark.django_db


def test_lista_de_usuarios_no_admin(admin_client, usuario):
    resposta = admin_client.get(reverse("admin:usuarios_usuario_changelist"))
    assert resposta.status_code == 200
    assert "joao@email.com" in resposta.content.decode()


def test_cadastrar_usuario_pelo_admin_guarda_hash(admin_client):
    resposta = admin_client.post(reverse("admin:usuarios_usuario_add"), {
        "email": "Novo@Rotae.com",
        "nome": "Novo Usuário",
        "password1": "Rotae@2026forte",
        "password2": "Rotae@2026forte",
    })

    assert resposta.status_code == 302
    novo = Usuario.objects.get(email="novo@rotae.com")
    assert novo.check_password("Rotae@2026forte")


def test_editar_usuario_no_admin_abre_o_formulario(admin_client, usuario):
    resposta = admin_client.get(reverse("admin:usuarios_usuario_change", args=[usuario.pk]))
    assert resposta.status_code == 200


def test_editar_no_admin_normaliza_email_e_barra_duplicado_por_caixa(admin_client, usuario):
    from usuarios.forms import UsuarioChangeForm

    outro = Usuario.objects.create_user(email="outro@email.com", password="x", nome="Outro")
    form = UsuarioChangeForm(instance=outro, data={
        "email": "JOAO@email.com", "nome": "Outro", "is_active": True, "password": outro.password,
    })

    assert not form.is_valid()
    assert "email" in form.errors


def test_login_do_admin_com_email_em_maiusculas(client, usuario, senha):
    assert client.login(email="JOAO@Email.com", password=senha)
