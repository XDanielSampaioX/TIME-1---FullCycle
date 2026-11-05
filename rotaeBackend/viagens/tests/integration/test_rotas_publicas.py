"""As rotas de consulta de viagens são públicas: não dependem de token."""
import pytest
from django.urls import reverse

pytestmark = pytest.mark.django_db


@pytest.fixture
def urls_publicas(criar_viagem):
    viagem = criar_viagem()
    return [
        reverse("lista_cidades"),
        reverse("lista_viagens"),
        reverse("detalhe_viagem", args=[viagem.id]),
        reverse("assentos_viagem", args=[viagem.id]),
    ]


def test_rotas_publicas_funcionam_mesmo_com_token_invalido(api_client, urls_publicas):
    """Um token velho/errado guardado no frontend ou no Swagger não pode bloquear a busca."""
    api_client.credentials(HTTP_AUTHORIZATION="Bearer token-vencido-ou-invalido")

    for url in urls_publicas:
        assert api_client.get(url).status_code == 200, url


def test_swagger_nao_pede_token_nas_rotas_publicas(api_client):
    schema = api_client.get(reverse("schema"), {"format": "json"}).json()

    for caminho in ("/api/v1/cidades/", "/api/v1/viagens/", "/api/v1/viagens/{id}/", "/api/v1/viagens/{id}/assentos/"):
        seguranca = schema["paths"][caminho]["get"].get("security", [])
        assert {"jwtAuth": []} not in seguranca, caminho
