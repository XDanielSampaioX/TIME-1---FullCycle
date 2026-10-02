import pytest
from django.core.exceptions import ValidationError

from viagens.models import Onibus, ViagemAssento
from viagens.services import criar_assentos_do_onibus, gerar_assentos_da_viagem

pytestmark = pytest.mark.django_db


def test_cria_assentos_numerados_do_onibus(onibus):
    criar_assentos_do_onibus(onibus)

    assert list(onibus.assentos.values_list("numero", flat=True)) == [1, 2, 3, 4]


def test_criar_assentos_novamente_nao_duplica(onibus):
    criar_assentos_do_onibus(onibus)
    criar_assentos_do_onibus(onibus)

    assert onibus.assentos.count() == 4


def test_viagem_tem_um_assento_disponivel_para_cada_assento_do_onibus(criar_viagem):
    viagem = criar_viagem()

    assert viagem.viagem_assentos.count() == viagem.onibus.total_assentos
    assert set(viagem.viagem_assentos.values_list("status", flat=True)) == {ViagemAssento.Status.DISPONIVEL}


def test_gerar_assentos_novamente_nao_duplica_nem_altera_status(criar_viagem):
    viagem = criar_viagem()
    segurado = viagem.viagem_assentos.first()
    segurado.status = ViagemAssento.Status.SEGURADO
    segurado.save()

    gerar_assentos_da_viagem(viagem)

    assert viagem.viagem_assentos.count() == 4
    segurado.refresh_from_db()
    assert segurado.status == ViagemAssento.Status.SEGURADO


def test_trocar_onibus_recria_os_assentos_da_viagem(criar_viagem):
    viagem = criar_viagem()
    viagem.onibus = Onibus.objects.create(identificacao="RT-002", total_assentos=2)
    viagem.save()

    gerar_assentos_da_viagem(viagem)

    assert viagem.viagem_assentos.count() == 2
    assert not viagem.viagem_assentos.exclude(assento__onibus=viagem.onibus).exists()


def test_trocar_onibus_com_assento_ocupado_falha(criar_viagem):
    viagem = criar_viagem()
    viagem.viagem_assentos.filter(assento__numero=1).update(status=ViagemAssento.Status.RESERVADO)
    viagem.onibus = Onibus.objects.create(identificacao="RT-002", total_assentos=2)
    viagem.save()

    with pytest.raises(ValidationError):
        gerar_assentos_da_viagem(viagem)
