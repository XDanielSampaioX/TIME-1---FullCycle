from datetime import timedelta

import pytest
from django.urls import reverse

from viagens.models import Cidade, Viagem, ViagemAssento

from .conftest import amanha_as

pytestmark = pytest.mark.django_db

URL_VIAGENS = reverse("lista_viagens")


def ids(resposta):
    return [viagem["id"] for viagem in resposta.json()["results"]]


def test_lista_viagens_no_formato_esperado_pelo_frontend(api_client, criar_viagem):
    viagem = criar_viagem()

    resposta = api_client.get(URL_VIAGENS)

    assert resposta.status_code == 200
    item = resposta.json()["results"][0]
    assert item["id"] == viagem.id
    assert item["origem"]["nome"] == "Fortaleza"
    assert item["destino"]["nome"] == "Sobral"
    assert item["onibus"]["identificacao"] == "RT-001"
    assert item["precoCentavos"] == 8990
    assert item["duracao"] == 240
    assert item["assentosLivres"] == 4
    assert {"partidaEm", "chegadaEm", "classe", "status"} <= item.keys()


def test_lista_somente_viagens_agendadas_e_futuras(api_client, criar_viagem):
    agendada = criar_viagem()
    criar_viagem(status=Viagem.Status.CANCELADA)
    criar_viagem(partida_em=amanha_as(8) - timedelta(days=2))

    resposta = api_client.get(URL_VIAGENS)

    assert ids(resposta) == [agendada.id]


def test_filtra_por_origem_destino_e_data(api_client, criar_viagem, fortaleza, sobral):
    ida = criar_viagem()
    criar_viagem(origem=sobral, destino=fortaleza)
    criar_viagem(partida_em=amanha_as(8) + timedelta(days=1))

    resposta = api_client.get(URL_VIAGENS, {
        "origem": fortaleza.id,
        "destino": sobral.id,
        "data": amanha_as(8).date().isoformat(),
    })

    assert ids(resposta) == [ida.id]


def test_filtra_por_varias_classes(api_client, criar_viagem):
    convencional = criar_viagem(classe=Viagem.Classe.CONVENCIONAL)
    executiva = criar_viagem(classe=Viagem.Classe.EXECUTIVA)

    resposta = api_client.get(URL_VIAGENS, {"classe": "EXECUTIVA"})
    assert ids(resposta) == [executiva.id]

    resposta = api_client.get(URL_VIAGENS, {"classe": ["EXECUTIVA", "CONVENCIONAL"]})
    assert sorted(ids(resposta)) == sorted([convencional.id, executiva.id])


def test_filtra_por_faixa_de_preco_em_camel_case(api_client, criar_viagem):
    criar_viagem(preco_centavos=5000)
    no_meio = criar_viagem(preco_centavos=8000)
    criar_viagem(preco_centavos=12000)

    resposta = api_client.get(URL_VIAGENS, {"precoMin": 6000, "precoMax": 10000})

    assert ids(resposta) == [no_meio.id]


def test_filtra_por_periodo_de_partida(api_client, criar_viagem):
    madrugada = criar_viagem(partida_em=amanha_as(2))
    manha = criar_viagem(partida_em=amanha_as(8))
    criar_viagem(partida_em=amanha_as(14))
    noite = criar_viagem(partida_em=amanha_as(22))

    resposta = api_client.get(URL_VIAGENS, {"periodo": [0, 1, 3]})

    assert sorted(ids(resposta)) == sorted([madrugada.id, manha.id, noite.id])


def test_filtra_por_assentos_livres_suficientes(api_client, criar_viagem):
    lotada = criar_viagem()
    lotada.viagem_assentos.exclude(assento__numero=1).update(status=ViagemAssento.Status.RESERVADO)
    livre = criar_viagem()

    resposta = api_client.get(URL_VIAGENS, {"passageiros": 2})

    assert ids(resposta) == [livre.id]


@pytest.mark.parametrize(
    ("ordering", "esperado"),
    [
        ("preco", ["barata", "media", "cara"]),
        ("-preco", ["cara", "media", "barata"]),
        ("partida", ["media", "cara", "barata"]),
        ("duracao", ["cara", "barata", "media"]),
    ],
)
def test_ordena_viagens(api_client, criar_viagem, ordering, esperado):
    viagens = {
        "barata": criar_viagem(preco_centavos=5000, partida_em=amanha_as(20), chegada_em=amanha_as(23)),
        "media": criar_viagem(preco_centavos=8000, partida_em=amanha_as(6), chegada_em=amanha_as(11)),
        "cara": criar_viagem(preco_centavos=12000, partida_em=amanha_as(9), chegada_em=amanha_as(10)),
    }

    resposta = api_client.get(URL_VIAGENS, {"ordering": ordering})

    assert ids(resposta) == [viagens[nome].id for nome in esperado]


def test_detalha_viagem(api_client, criar_viagem):
    viagem = criar_viagem()

    resposta = api_client.get(reverse("detalhe_viagem", args=[viagem.id]))

    assert resposta.status_code == 200
    assert resposta.json()["id"] == viagem.id
    assert resposta.json()["onibus"]["totalAssentos"] == 4
    assert resposta.json()["assentosLivres"] == 4


def test_detalhe_de_viagem_inexistente_retorna_404(api_client, db):
    assert api_client.get(reverse("detalhe_viagem", args=[999])).status_code == 404


def test_lista_assentos_da_viagem_com_status(api_client, criar_viagem):
    viagem = criar_viagem()
    viagem.viagem_assentos.filter(assento__numero=2).update(status=ViagemAssento.Status.SEGURADO)
    criar_viagem()

    resposta = api_client.get(reverse("assentos_viagem", args=[viagem.id]))

    assert resposta.status_code == 200
    assentos = resposta.json()
    assert [assento["numero"] for assento in assentos] == [1, 2, 3, 4]
    assert [assento["status"] for assento in assentos] == ["DISPONIVEL", "SEGURADO", "DISPONIVEL", "DISPONIVEL"]
    assert {"id", "viagemId", "assentoId"} <= assentos[0].keys()


def test_assentos_de_viagem_inexistente_retorna_404(api_client, db):
    assert api_client.get(reverse("assentos_viagem", args=[999])).status_code == 404


def test_listagem_de_cidades_continua_funcionando_em_camel_case(api_client, db):
    Cidade.objects.create(nome="Fortaleza", uf="CE")

    resposta = api_client.get(reverse("lista_cidades"))

    assert resposta.status_code == 200
    assert "imagemUrl" in resposta.json()["results"][0]
