from datetime import timedelta

import pytest
from django.urls import reverse
from django.utils import timezone

from reservas.models import Passageiro, Reserva
from reservas.services import criar_reserva
from usuarios.models import Usuario

pytestmark = pytest.mark.django_db

CPF_USUARIO = "52998224725"
CPF_SEM_CONTA = "11144477735"


def url_cadastrar_passageiros(pk):
    return reverse("cadastrar_passageiros", kwargs={"pk": pk})


def url_detalhe_reserva(pk):
    return reverse("detalhe_reserva", kwargs={"pk": pk})


def criar_reserva_com_assentos(usuario, viagem, quantidade):
    livres = viagem.viagem_assentos.filter(reserva__isnull=True).order_by("pk")
    ids = list(livres.values_list("id", flat=True)[:quantidade])
    return criar_reserva(usuario=usuario, viagem_id=viagem.id, viagem_assento_ids=ids)


def passageiro(**sobrescritas):
    dados = {
        "nome": "João da Silva",
        "email": "joao@email.com",
        "celular": "85999990000",
        "dataNasc": "1995-04-20",
        "cpf": CPF_USUARIO,
    }
    return {**dados, **sobrescritas}


def dois_passageiros():
    return [
        passageiro(),
        passageiro(nome="Maria de Sousa", email="maria@email.com", dataNasc="1996-05-15", cpf=CPF_SEM_CONTA),
    ]


@pytest.fixture
def reserva(usuario, viagem):
    return criar_reserva_com_assentos(usuario, viagem, 2)


# --- Cadastro de passageiros (POST /reservas/{id}/passageiros/) ---


def test_cadastrar_passageiros_sucesso(api_client, autenticar, reserva, usuario):
    autenticar()

    resposta = api_client.post(url_cadastrar_passageiros(reserva.id), dois_passageiros(), format="json")

    assert resposta.status_code == 201
    data = resposta.json()
    assert [p["nome"] for p in data] == ["João da Silva", "Maria de Sousa"]
    assert data[0]["dataNasc"] == "1995-04-20"

    # Só o passageiro com o CPF do usuário autenticado é vinculado à conta dele
    assert data[0]["usuarioId"] == usuario.id
    assert data[1]["usuarioId"] is None

    passageiros = Passageiro.objects.filter(reserva=reserva).order_by("id")
    assert [p.cpf for p in passageiros] == [CPF_USUARIO, CPF_SEM_CONTA]


def test_cadastrar_passageiros_nao_vincula_conta_de_terceiro_com_mesmo_cpf(api_client, autenticar, reserva):
    Usuario.objects.create_user(
        email="terceiro@email.com",
        password="Rotae@2026forte",
        nome="Maria de Sousa",
        celular="85988880000",
        data_nasc="1996-05-15",
        cpf=CPF_SEM_CONTA,
    )
    autenticar()

    resposta = api_client.post(url_cadastrar_passageiros(reserva.id), dois_passageiros(), format="json")

    assert resposta.status_code == 201
    assert resposta.json()[1]["usuarioId"] is None


def test_cadastrar_passageiros_mesmo_cpf_em_reservas_diferentes(api_client, autenticar, reserva, usuario, viagem):
    autenticar()
    outra_reserva = criar_reserva_com_assentos(usuario, viagem, 1)

    api_client.post(url_cadastrar_passageiros(reserva.id), dois_passageiros(), format="json")
    resposta = api_client.post(url_cadastrar_passageiros(outra_reserva.id), [passageiro()], format="json")

    assert resposta.status_code == 201
    assert Passageiro.objects.filter(cpf=CPF_USUARIO).count() == 2


def test_cadastrar_passageiros_quantidade_diferente_dos_assentos_retorna_400(api_client, autenticar, reserva):
    autenticar()

    resposta = api_client.post(url_cadastrar_passageiros(reserva.id), [passageiro()], format="json")

    assert resposta.status_code == 400
    assert not Passageiro.objects.filter(reserva=reserva).exists()


def test_cadastrar_passageiros_cpfs_duplicados_retorna_400(api_client, autenticar, reserva):
    autenticar()

    resposta = api_client.post(
        url_cadastrar_passageiros(reserva.id),
        [passageiro(), passageiro(nome="Outro Nome")],
        format="json",
    )

    assert resposta.status_code == 400
    assert not Passageiro.objects.filter(reserva=reserva).exists()


@pytest.mark.parametrize(
    "campo, valor",
    [
        ("cpf", "12345678901"),
        ("celular", "999"),
        ("dataNasc", (timezone.localdate() + timedelta(days=1)).isoformat()),
        ("email", "email-invalido"),
        ("nome", ""),
    ],
)
def test_cadastrar_passageiros_dados_invalidos_retorna_400(api_client, autenticar, reserva, campo, valor):
    autenticar()
    passageiros = dois_passageiros()
    passageiros[1][campo] = valor

    resposta = api_client.post(url_cadastrar_passageiros(reserva.id), passageiros, format="json")

    assert resposta.status_code == 400
    assert not Passageiro.objects.filter(reserva=reserva).exists()


def test_cadastrar_passageiros_payload_que_nao_e_lista_retorna_400(api_client, autenticar, reserva):
    autenticar()

    resposta = api_client.post(url_cadastrar_passageiros(reserva.id), passageiro(), format="json")

    assert resposta.status_code == 400


def test_cadastrar_passageiros_sem_autenticacao_retorna_401(api_client, reserva):
    resposta = api_client.post(url_cadastrar_passageiros(reserva.id), dois_passageiros(), format="json")

    assert resposta.status_code == 401


def test_cadastrar_passageiros_reserva_de_outro_usuario_retorna_404(api_client, autenticar_outro, reserva):
    autenticar_outro()

    resposta = api_client.post(url_cadastrar_passageiros(reserva.id), dois_passageiros(), format="json")

    assert resposta.status_code == 404
    assert not Passageiro.objects.filter(reserva=reserva).exists()


def test_cadastrar_passageiros_reserva_inexistente_retorna_404(api_client, autenticar):
    autenticar()

    resposta = api_client.post(url_cadastrar_passageiros(99999), dois_passageiros(), format="json")

    assert resposta.status_code == 404


def test_cadastrar_passageiros_reserva_que_ja_possui_passageiros_retorna_409(api_client, autenticar, reserva):
    autenticar()
    api_client.post(url_cadastrar_passageiros(reserva.id), dois_passageiros(), format="json")

    resposta = api_client.post(url_cadastrar_passageiros(reserva.id), dois_passageiros(), format="json")

    assert resposta.status_code == 409
    assert Passageiro.objects.filter(reserva=reserva).count() == 2


@pytest.mark.parametrize(
    "status_reserva",
    [Reserva.Status.CANCELADO, Reserva.Status.PAGO, Reserva.Status.EXPIRADO, Reserva.Status.FALHA],
)
def test_cadastrar_passageiros_reserva_nao_pendente_retorna_409(api_client, autenticar, reserva, status_reserva):
    autenticar()
    Reserva.objects.filter(pk=reserva.pk).update(status=status_reserva)

    resposta = api_client.post(url_cadastrar_passageiros(reserva.id), dois_passageiros(), format="json")

    assert resposta.status_code == 409
    assert not Passageiro.objects.filter(reserva=reserva).exists()


def test_cadastrar_passageiros_reserva_pendente_mas_vencida_retorna_409(api_client, autenticar, reserva):
    autenticar()
    Reserva.objects.filter(pk=reserva.pk).update(expira_em=timezone.now() - timedelta(minutes=1))

    resposta = api_client.post(url_cadastrar_passageiros(reserva.id), dois_passageiros(), format="json")

    assert resposta.status_code == 409
    assert not Passageiro.objects.filter(reserva=reserva).exists()


# --- Passageiros no detalhe da reserva (GET /reservas/{id}/) ---


def test_detalhe_reserva_retorna_passageiros(api_client, autenticar, reserva):
    autenticar()
    api_client.post(url_cadastrar_passageiros(reserva.id), dois_passageiros(), format="json")

    resposta = api_client.get(url_detalhe_reserva(reserva.id))

    assert resposta.status_code == 200
    passageiros = resposta.json()["passageiros"]
    assert [p["cpf"] for p in passageiros] == [CPF_USUARIO, CPF_SEM_CONTA]


def test_detalhe_reserva_sem_passageiros_retorna_lista_vazia(api_client, autenticar, reserva):
    autenticar()

    resposta = api_client.get(url_detalhe_reserva(reserva.id))

    assert resposta.status_code == 200
    assert resposta.json()["passageiros"] == []


def test_minhas_reservas_nao_retorna_passageiros(api_client, autenticar, reserva):
    autenticar()
    api_client.post(url_cadastrar_passageiros(reserva.id), dois_passageiros(), format="json")

    resposta = api_client.get(reverse("minhas_reservas"))

    assert resposta.status_code == 200
    assert "passageiros" not in resposta.json()["results"][0]
