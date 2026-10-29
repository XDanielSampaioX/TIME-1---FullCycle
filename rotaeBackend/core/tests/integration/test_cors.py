"""CORS: o frontend precisa conseguir chamar a API tanto pelo Next direto quanto pelo Nginx."""
import pytest
from django.urls import reverse


@pytest.mark.parametrize("origem", [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost",
    "http://127.0.0.1",
])
def test_cors_libera_o_frontend_local_e_o_nginx(client, origem):
    resposta = client.options(
        reverse("health"),
        HTTP_ORIGIN=origem,
        HTTP_ACCESS_CONTROL_REQUEST_METHOD="GET",
    )

    assert resposta.headers.get("Access-Control-Allow-Origin") == origem


def test_cors_nao_libera_origem_desconhecida(client):
    resposta = client.options(
        reverse("health"),
        HTTP_ORIGIN="http://site-qualquer.com",
        HTTP_ACCESS_CONTROL_REQUEST_METHOD="GET",
    )

    assert "Access-Control-Allow-Origin" not in resposta.headers
