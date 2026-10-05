from datetime import timedelta

import pytest
from django.core.exceptions import ValidationError
from django.db import IntegrityError

from viagens.models import Assento, Onibus, ViagemAssento

from .conftest import amanha_as

pytestmark = pytest.mark.django_db


def test_duracao_e_calculada_em_minutos(criar_viagem):
    viagem = criar_viagem(partida_em=amanha_as(8), chegada_em=amanha_as(12, 30))

    assert viagem.duracao == 270


def test_viagem_nao_aceita_origem_igual_ao_destino(criar_viagem, fortaleza):
    with pytest.raises(IntegrityError):
        criar_viagem(destino=fortaleza)


def test_viagem_nao_aceita_chegada_antes_da_partida(criar_viagem):
    with pytest.raises(IntegrityError):
        criar_viagem(partida_em=amanha_as(10), chegada_em=amanha_as(9))


def test_clean_da_viagem_explica_os_erros(criar_viagem, fortaleza):
    viagem = criar_viagem()
    viagem.destino = fortaleza
    viagem.chegada_em = viagem.partida_em - timedelta(hours=1)

    with pytest.raises(ValidationError) as erro:
        viagem.clean()

    assert set(erro.value.message_dict) == {"destino", "chegada_em"}


def test_assento_nao_repete_numero_no_mesmo_onibus(onibus):
    Assento.objects.create(onibus=onibus, numero=1)

    with pytest.raises(IntegrityError):
        Assento.objects.create(onibus=onibus, numero=1)


def test_viagem_assento_nao_pode_ser_duplicado(criar_viagem):
    viagem = criar_viagem()
    assento = viagem.onibus.assentos.first()

    with pytest.raises(IntegrityError):
        ViagemAssento.objects.create(viagem=viagem, assento=assento)


def test_assento_da_viagem_deve_ser_do_onibus_da_viagem(criar_viagem):
    viagem = criar_viagem()
    outro_onibus = Onibus.objects.create(identificacao="RT-002", total_assentos=1)
    assento_de_outro_onibus = Assento.objects.create(onibus=outro_onibus, numero=1)

    with pytest.raises(ValidationError):
        ViagemAssento(viagem=viagem, assento=assento_de_outro_onibus).clean()


def test_nao_permite_trocar_onibus_com_assento_ocupado(criar_viagem):
    viagem = criar_viagem()
    viagem.viagem_assentos.update(status=ViagemAssento.Status.SEGURADO)
    viagem.onibus = Onibus.objects.create(identificacao="RT-002", total_assentos=2)

    with pytest.raises(ValidationError) as erro:
        viagem.clean()

    assert "onibus" in erro.value.message_dict
