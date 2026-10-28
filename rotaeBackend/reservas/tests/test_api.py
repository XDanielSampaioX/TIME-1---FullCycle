from datetime import datetime, timedelta
import threading

import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from viagens.models import Cidade, Onibus, Viagem, ViagemAssento
from viagens.services import gerar_assentos_da_viagem
from reservas.models import Reserva

pytestmark = pytest.mark.django_db

URL_CRIAR_RESERVA = reverse("criar_reserva")
URL_MINHAS_RESERVAS = reverse("minhas_reservas")


def url_detalhe_reserva(pk):
    return reverse("detalhe_reserva", kwargs={"pk": pk})


def url_cancelar_reserva(pk):
    return reverse("cancelar_reserva", kwargs={"pk": pk})


def amanha_as(hora, minuto=0):
    amanha = timezone.localdate() + timedelta(days=1)
    return timezone.make_aware(
        datetime.combine(amanha, datetime.min.time()).replace(hour=hora, minute=minuto)
    )


@pytest.fixture
def fortaleza(db):
    return Cidade.objects.create(nome="Fortaleza", uf="CE")


@pytest.fixture
def sobral(db):
    return Cidade.objects.create(nome="Sobral", uf="CE")


@pytest.fixture
def onibus(db):
    return Onibus.objects.create(identificacao="RT-001", total_assentos=4, modelo="Marcopolo G8")


@pytest.fixture
def viagem(fortaleza, sobral, onibus):
    v = Viagem.objects.create(
        onibus=onibus,
        origem=fortaleza,
        destino=sobral,
        classe=Viagem.Classe.CONVENCIONAL,
        partida_em=amanha_as(8),
        chegada_em=amanha_as(12),
        preco_centavos=8990,
        status=Viagem.Status.AGENDADA,
    )
    gerar_assentos_da_viagem(v)
    return v


@pytest.fixture
def outra_viagem(fortaleza, sobral, onibus):
    v = Viagem.objects.create(
        onibus=onibus,
        origem=fortaleza,
        destino=sobral,
        classe=Viagem.Classe.CONVENCIONAL,
        partida_em=amanha_as(14),
        chegada_em=amanha_as(18),
        preco_centavos=7500,
        status=Viagem.Status.AGENDADA,
    )
    gerar_assentos_da_viagem(v)
    return v


def ids_viagem_assentos(viagem, numeros):
    """Retorna os IDs de ViagemAssento (PKs) para os números de assento informados."""
    return list(
        viagem.viagem_assentos
        .filter(assento__numero__in=numeros)
        .order_by("assento__numero")
        .values_list("id", flat=True)
    )


# --- Testes de Criação de Reserva ---


def test_criar_reserva_sucesso(api_client, autenticar, viagem):
    autenticar()
    assentos_ids = ids_viagem_assentos(viagem, [1, 2])

    antes = timezone.now()
    resposta = api_client.post(
        URL_CRIAR_RESERVA,
        {"viagem_id": viagem.id, "viagem_assento_ids": assentos_ids},
        format="json",
    )
    depois = timezone.now()

    assert resposta.status_code == 201
    data = resposta.json()
    assert data["status"] == "PAGAMENTO_PENDENTE"
    assert data["viagem"]["id"] == viagem.id
    assert data["valorTotal"] == 8990 * 2
    assert len(data["assentos"]) == 2

    # Valida expira_em em torno de 24h a partir da criação
    expira_em = datetime.fromisoformat(data["expiraEm"].replace("Z", "+00:00"))
    assert antes + timedelta(hours=23, minutes=59) <= expira_em <= depois + timedelta(hours=24, minutes=1)

    # Verifica persistência no banco
    reserva = Reserva.objects.get(pk=data["id"])
    assert reserva.status == Reserva.Status.PAGAMENTO_PENDENTE
    assert reserva.valor_total == 17980

    # Verifica se os assentos no banco foram atualizados para SEGURADO e vinculados à reserva
    assentos_db = ViagemAssento.objects.filter(pk__in=assentos_ids)
    for a in assentos_db:
        assert a.status == ViagemAssento.Status.SEGURADO
        assert a.reserva_id == reserva.id


def test_criar_reserva_assento_indisponivel_retorna_lista_assentos(api_client, autenticar, viagem):
    """Testa que o erro 409 retorna a lista de assentos indisponíveis."""
    autenticar()
    assentos_ids = ids_viagem_assentos(viagem, [1])

    # Primeiro bloqueio com sucesso
    resp1 = api_client.post(
        URL_CRIAR_RESERVA,
        {"viagem_id": viagem.id, "viagem_assento_ids": assentos_ids},
        format="json",
    )
    assert resp1.status_code == 201

    # Segunda tentativa no mesmo assento deve retornar 409 com lista de assentos
    resp2 = api_client.post(
        URL_CRIAR_RESERVA,
        {"viagem_id": viagem.id, "viagem_assento_ids": assentos_ids},
        format="json",
    )
    assert resp2.status_code == 409
    data = resp2.json()
    assert "assentos" in data
    assert len(data["assentos"]) == 1
    assert data["assentos"][0] == assentos_ids[0]

def test_criar_reserva_assento_ja_reservado_retorna_409(api_client, autenticar, viagem):
    autenticar()
    assento = viagem.viagem_assentos.filter(assento__numero=1).first()
    assento.status = ViagemAssento.Status.RESERVADO
    assento.save()

    resposta = api_client.post(
        URL_CRIAR_RESERVA,
        {"viagem_id": viagem.id, "viagem_assento_ids": [assento.id]},
        format="json",
    )
    assert resposta.status_code == 409


def test_criar_reserva_rollback_quando_um_dos_assentos_indisponivel(api_client, autenticar, viagem):
    """
    Se pedir 1 assento livre e 1 ocupado, deve falhar com 409 e nada deve ser alterado
    (rollback total: nem reserva criada, nem o assento livre segurado).
    """
    autenticar()
    livre_id = ids_viagem_assentos(viagem, [1])[0]
    ocupado_id = ids_viagem_assentos(viagem, [2])[0]

    ocupado = ViagemAssento.objects.get(pk=ocupado_id)
    ocupado.status = ViagemAssento.Status.SEGURADO
    ocupado.save()

    total_reservas_antes = Reserva.objects.count()

    resposta = api_client.post(
        URL_CRIAR_RESERVA,
        {"viagem_id": viagem.id, "viagem_assento_ids": [livre_id, ocupado_id]},
        format="json",
    )

    assert resposta.status_code == 409
    assert Reserva.objects.count() == total_reservas_antes

    # Assento livre continua DISPONIVEL e sem reserva vinculada
    livre_db = ViagemAssento.objects.get(pk=livre_id)
    assert livre_db.status == ViagemAssento.Status.DISPONIVEL
    assert livre_db.reserva is None


def test_criar_reserva_sem_autenticacao_retorna_401(api_client, viagem):
    assentos_ids = ids_viagem_assentos(viagem, [1])
    resposta = api_client.post(
        URL_CRIAR_RESERVA,
        {"viagem_id": viagem.id, "viagem_assento_ids": assentos_ids},
        format="json",
    )
    assert resposta.status_code == 401


def test_criar_reserva_viagem_inexistente_retorna_400(api_client, autenticar):
    autenticar()
    resposta = api_client.post(
        URL_CRIAR_RESERVA,
        {"viagem_id": 999999, "viagem_assento_ids": [1]},
        format="json",
    )
    assert resposta.status_code == 400


def test_criar_reserva_viagem_cancelada_rejeita_400(api_client, autenticar, viagem):
    autenticar()
    viagem.status = Viagem.Status.CANCELADA
    viagem.save()

    assentos_ids = ids_viagem_assentos(viagem, [1])
    resposta = api_client.post(
        URL_CRIAR_RESERVA,
        {"viagem_id": viagem.id, "viagem_assento_ids": assentos_ids},
        format="json",
    )
    assert resposta.status_code == 400


def test_criar_reserva_viagem_passada_rejeita_400(api_client, autenticar, viagem):
    autenticar()
    viagem.partida_em = timezone.now() - timedelta(hours=2)
    viagem.chegada_em = timezone.now() - timedelta(hours=1)
    viagem.save()

    assentos_ids = ids_viagem_assentos(viagem, [1])
    resposta = api_client.post(
        URL_CRIAR_RESERVA,
        {"viagem_id": viagem.id, "viagem_assento_ids": assentos_ids},
        format="json",
    )
    assert resposta.status_code == 400


def test_criar_reserva_assento_de_outra_viagem_retorna_400(api_client, autenticar, viagem, outra_viagem):
    autenticar()
    assento_outra_viagem = ids_viagem_assentos(outra_viagem, [1])[0]

    resposta = api_client.post(
        URL_CRIAR_RESERVA,
        {"viagem_id": viagem.id, "viagem_assento_ids": [assento_outra_viagem]},
        format="json",
    )
    assert resposta.status_code == 400
    data = resposta.json()
    assert "assentos" in data
    assert data["assentos"] == [assento_outra_viagem]


def test_criar_reserva_assentos_duplicados_retorna_400(api_client, autenticar, viagem):
    autenticar()
    assento_id = ids_viagem_assentos(viagem, [1])[0]

    resposta = api_client.post(
        URL_CRIAR_RESERVA,
        {"viagem_id": viagem.id, "viagem_assento_ids": [assento_id, assento_id]},
        format="json",
    )
    assert resposta.status_code == 400


# --- Testes de Consulta de Reserva (GET /reservas/{id}/) ---


def test_detalhe_reserva_sucesso(api_client, autenticar, viagem):
    autenticar()
    assentos_ids = ids_viagem_assentos(viagem, [1])
    post_resp = api_client.post(
        URL_CRIAR_RESERVA,
        {"viagem_id": viagem.id, "viagem_assento_ids": assentos_ids},
        format="json",
    )
    reserva_id = post_resp.json()["id"]

    resposta = api_client.get(url_detalhe_reserva(reserva_id))
    assert resposta.status_code == 200
    data = resposta.json()
    assert data["id"] == reserva_id
    assert data["status"] == "PAGAMENTO_PENDENTE"
    assert data["valorTotal"] == 8990
    assert len(data["assentos"]) == 1
    # Verifica que viagem é um objeto completo
    assert "viagem" in data
    assert data["viagem"]["id"] == viagem.id
    assert "origem" in data["viagem"]
    assert "destino" in data["viagem"]


def test_detalhe_reserva_outro_usuario_retorna_404(api_client, autenticar, autenticar_outro, viagem):
    autenticar()
    assentos_ids = ids_viagem_assentos(viagem, [1])
    post_resp = api_client.post(
        URL_CRIAR_RESERVA,
        {"viagem_id": viagem.id, "viagem_assento_ids": assentos_ids},
        format="json",
    )
    reserva_id = post_resp.json()["id"]

    # Usuário B tenta consultar a reserva do Usuário A
    autenticar_outro()
    resposta = api_client.get(url_detalhe_reserva(reserva_id))
    assert resposta.status_code == 404


def test_detalhe_reserva_inexistente_retorna_404(api_client, autenticar):
    autenticar()
    resposta = api_client.get(url_detalhe_reserva(99999))
    assert resposta.status_code == 404


# --- Testes de Cancelamento (POST /reservas/{id}/cancelar/) ---


def test_cancelar_reserva_pendente_sucesso(api_client, autenticar, viagem):
    autenticar()
    assentos_ids = ids_viagem_assentos(viagem, [1, 2])
    post_resp = api_client.post(
        URL_CRIAR_RESERVA,
        {"viagem_id": viagem.id, "viagem_assento_ids": assentos_ids},
        format="json",
    )
    reserva_id = post_resp.json()["id"]

    resposta = api_client.post(url_cancelar_reserva(reserva_id))
    assert resposta.status_code == 200
    data = resposta.json()
    assert data["status"] == "CANCELADO"

    # Confirma no banco: reserva CANCELADO e assentos DISPONIVEL sem reserva
    reserva_db = Reserva.objects.get(pk=reserva_id)
    assert reserva_db.status == Reserva.Status.CANCELADO

    assentos_db = ViagemAssento.objects.filter(pk__in=assentos_ids)
    for a in assentos_db:
        assert a.status == ViagemAssento.Status.DISPONIVEL
        assert a.reserva is None


def test_cancelar_reserva_outro_usuario_retorna_404(api_client, autenticar, autenticar_outro, viagem):
    autenticar()
    assentos_ids = ids_viagem_assentos(viagem, [1])
    post_resp = api_client.post(
        URL_CRIAR_RESERVA,
        {"viagem_id": viagem.id, "viagem_assento_ids": assentos_ids},
        format="json",
    )
    reserva_id = post_resp.json()["id"]

    autenticar_outro()
    resposta = api_client.post(url_cancelar_reserva(reserva_id))
    assert resposta.status_code == 404


def test_cancelar_reserva_ja_cancelada_retorna_400(api_client, autenticar, viagem):
    autenticar()
    assentos_ids = ids_viagem_assentos(viagem, [1])
    post_resp = api_client.post(
        URL_CRIAR_RESERVA,
        {"viagem_id": viagem.id, "viagem_assento_ids": assentos_ids},
        format="json",
    )
    reserva_id = post_resp.json()["id"]

    resp1 = api_client.post(url_cancelar_reserva(reserva_id))
    assert resp1.status_code == 200

    resp2 = api_client.post(url_cancelar_reserva(reserva_id))
    assert resp2.status_code == 400


# --- Testes de Listagem (/me/reservas/) ---


def test_minhas_reservas_retorna_apenas_do_usuario_autenticado(api_client, autenticar, autenticar_outro, viagem, outra_viagem):
    # Usuário A cria 2 reservas
    autenticar()
    a1 = ids_viagem_assentos(viagem, [1])
    a2 = ids_viagem_assentos(viagem, [2])
    api_client.post(URL_CRIAR_RESERVA, {"viagem_id": viagem.id, "viagem_assento_ids": a1}, format="json")
    api_client.post(URL_CRIAR_RESERVA, {"viagem_id": viagem.id, "viagem_assento_ids": a2}, format="json")

    # Usuário B cria 1 reserva
    autenticar_outro()
    b1 = ids_viagem_assentos(outra_viagem, [1])
    api_client.post(URL_CRIAR_RESERVA, {"viagem_id": outra_viagem.id, "viagem_assento_ids": b1}, format="json")

    # Usuário A busca suas reservas
    autenticar()
    resposta = api_client.get(URL_MINHAS_RESERVAS)
    assert resposta.status_code == 200
    data = resposta.json()
    # Com paginação, o resultado vem em data["results"]
    assert data["count"] == 2
    assert len(data["results"]) == 2


def test_minhas_reservas_sem_autenticacao_retorna_401(api_client):
    resposta = api_client.get(URL_MINHAS_RESERVAS)
    assert resposta.status_code == 401


# --- Teste de Concorrência Real com PostgreSQL ---


@pytest.mark.django_db(transaction=True)
def test_concorrencia_dois_usuarios_mesmo_assento_apenas_um_reserva(viagem, usuario, outro_usuario, token, outro_token):
    assento_id = ids_viagem_assentos(viagem, [1])[0]

    resultados = []
    barreira = threading.Barrier(2)

    def tentar_reservar(user_token):
        try:
            client = APIClient()
            client.credentials(HTTP_AUTHORIZATION=f"Bearer {user_token}")
            barreira.wait()
            resp = client.post(
                URL_CRIAR_RESERVA,
                {"viagem_id": viagem.id, "viagem_assento_ids": [assento_id]},
                format="json",
            )
            resultados.append(resp.status_code)
        finally:
            from django.db import connections
            connections.close_all()

    t1 = threading.Thread(target=tentar_reservar, args=(token,))
    t2 = threading.Thread(target=tentar_reservar, args=(outro_token,))

    t1.start()
    t2.start()
    t1.join()
    t2.join()
    from django.db import connections
    connections.close_all()

    assert 201 in resultados
    assert 409 in resultados
    assert Reserva.objects.count() == 1

    va = ViagemAssento.objects.get(pk=assento_id)
    assert va.status == ViagemAssento.Status.SEGURADO
    assert va.reserva is not None