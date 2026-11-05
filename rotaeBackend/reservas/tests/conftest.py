from datetime import datetime, timedelta

import pytest
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from viagens.models import Cidade, Onibus, Viagem
from viagens.services import gerar_assentos_da_viagem


@pytest.fixture
def outro_usuario(db, senha):
    """Segundo usuário para testar isolamento de reservas e concorrência."""
    from usuarios.models import Usuario

    return Usuario.objects.create_user(
        email="maria@email.com",
        password=senha,
        nome="Maria de Sousa",
        celular="85988880000",
        data_nasc="1996-05-15",
        cpf="12345678901",
    )


@pytest.fixture
def outro_token(outro_usuario):
    """String do access token do segundo usuário emitido em memória."""
    return str(RefreshToken.for_user(outro_usuario).access_token)


@pytest.fixture
def outro_cliente(outro_token):
    """Cliente de teste pré-autenticado com o token do segundo usuário."""
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {outro_token}")
    return client


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
