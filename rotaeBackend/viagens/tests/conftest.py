from datetime import datetime, timedelta

import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from viagens.models import Cidade, Onibus, Viagem
from viagens.services import gerar_assentos_da_viagem


def amanha_as(hora, minuto=0):
    """Datetime de amanhã no fuso do projeto (America/Sao_Paulo)."""
    amanha = timezone.localdate() + timedelta(days=1)
    return timezone.make_aware(datetime.combine(amanha, datetime.min.time()).replace(hour=hora, minute=minuto))


@pytest.fixture
def api_client():
    return APIClient()


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
def criar_viagem(fortaleza, sobral, onibus):
    def _criar_viagem(**dados):
        partida = dados.pop("partida_em", amanha_as(8))
        valores = {
            "onibus": onibus,
            "origem": fortaleza,
            "destino": sobral,
            "classe": Viagem.Classe.CONVENCIONAL,
            "partida_em": partida,
            "chegada_em": partida + timedelta(hours=4),
            "preco_centavos": 8990,
        }
        valores.update(dados)
        viagem = Viagem.objects.create(**valores)
        gerar_assentos_da_viagem(viagem)
        return viagem

    return _criar_viagem
