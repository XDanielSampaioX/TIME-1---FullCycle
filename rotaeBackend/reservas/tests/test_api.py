from datetime import datetime, timedelta

import pytest
from django.urls import reverse
from django.utils import timezone

from viagens.models import Cidade, Onibus, Viagem, ViagemAssento
from viagens.services import gerar_assentos_da_viagem

pytestmark = pytest.mark.django_db

URL_CRIAR_RESERVA = reverse("criar_reserva")


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
    viagem = Viagem.objects.create(
        onibus=onibus,
        origem=fortaleza,
        destino=sobral,
        classe=Viagem.Classe.CONVENCIONAL,
        partida_em=amanha_as(8),
        chegada_em=amanha_as(12),
        preco_centavos=8990,
        status=Viagem.Status.AGENDADA,
    )
    gerar_assentos_da_viagem(viagem)
    return viagem


def ids_assentos(viagem, numeros):
    """Retorna os IDs de ViagemAssento para os números de assento informados."""
    return list(
        viagem.viagem_assentos
        .filter(assento__numero__in=numeros)
        .order_by("assento__numero")
        .values_list("assento_id", flat=True)
    )


class TestCriarReservaSucesso:
    """Testa o fluxo feliz de criação de reserva."""

    def test_cria_reserva_com_sucesso(self, api_client, autenticar, viagem):
        autenticar()
        assentos = ids_assentos(viagem, [1, 2])

        resposta = api_client.post(URL_CRIAR_RESERVA, {
            "viagem_id": viagem.id,
            "assento_ids": assentos,
        }, format="json")

        assert resposta.status_code == 201
        data = resposta.json()
        assert data["status"] == "PENDENTE"
        assert data["viagemId"] == viagem.id
        assert len(data["assentos"]) == 2
        assert {a["numero"] for a in data["assentos"]} == {1, 2}

    def test_assentos_ficam_segurados_apos_reserva(self, api_client, autenticar, viagem):
        autenticar()
        assentos = ids_assentos(viagem, [1])

        resposta = api_client.post(URL_CRIAR_RESERVA, {
            "viagem_id": viagem.id,
            "assento_ids": assentos,
        }, format="json")

        assert resposta.status_code == 201
        status_atual = list(
            viagem.viagem_assentos
            .filter(assento_id__in=assentos)
            .values_list("status", flat=True)
        )
        assert all(s == ViagemAssento.Status.SEGURADO for s in status_atual)


class TestCriarReservaConflito:
    """Testa cenários de conflito e concorrência."""

    def test_assento_ja_reservado_retorna_409(self, api_client, autenticar, viagem):
        autenticar()
        assentos = ids_assentos(viagem, [1])

        # Primeira reserva — sucesso
        resposta1 = api_client.post(URL_CRIAR_RESERVA, {
            "viagem_id": viagem.id,
            "assento_ids": assentos,
        }, format="json")
        assert resposta1.status_code == 201

        # Segunda reserva no mesmo assento — conflito
        resposta2 = api_client.post(URL_CRIAR_RESERVA, {
            "viagem_id": viagem.id,
            "assento_ids": assentos,
        }, format="json")
        assert resposta2.status_code == 409

    def test_sem_autenticacao_retorna_401(self, api_client, viagem):
        assentos = ids_assentos(viagem, [1])

        resposta = api_client.post(URL_CRIAR_RESERVA, {
            "viagem_id": viagem.id,
            "assento_ids": assentos,
        }, format="json")

        assert resposta.status_code == 401

    def test_viagem_inexistente_retorna_400(self, api_client, autenticar, viagem):
        autenticar()
        assentos = ids_assentos(viagem, [1])

        resposta = api_client.post(URL_CRIAR_RESERVA, {
            "viagem_id": 99999,
            "assento_ids": assentos,
        }, format="json")

        assert resposta.status_code == 400

    def test_assento_de_outra_viagem_retorna_erro(self, api_client, autenticar, viagem, fortaleza, sobral):
        """Assentos de uma viagem não podem ser usados em outra (ônibus diferente)."""
        autenticar()

        outro_onibus = Onibus.objects.create(identificacao="RT-002", total_assentos=4, modelo="Marcopolo G8")
        outra_viagem = Viagem.objects.create(
            onibus=outro_onibus,
            origem=sobral,
            destino=fortaleza,
            classe=Viagem.Classe.EXECUTIVA,
            partida_em=amanha_as(14),
            chegada_em=amanha_as(18),
            preco_centavos=12000,
            status=Viagem.Status.AGENDADA,
        )
        gerar_assentos_da_viagem(outra_viagem)

        # Tenta usar assentos da outra viagem (ônibus diferente) na viagem original
        assentos_outra = ids_assentos(outra_viagem, [1, 2])

        resposta = api_client.post(URL_CRIAR_RESERVA, {
            "viagem_id": viagem.id,
            "assento_ids": assentos_outra,
        }, format="json")

        # Retorna 409 pois os assentos não pertencem à viagem (indisponíveis para ela)
        assert resposta.status_code == 409

    def test_assentos_duplicados_retorna_400(self, api_client, autenticar, viagem):
        autenticar()
        assentos = ids_assentos(viagem, [1])

        resposta = api_client.post(URL_CRIAR_RESERVA, {
            "viagem_id": viagem.id,
            "assento_ids": [assentos[0], assentos[0]],
        }, format="json")

        assert resposta.status_code == 400