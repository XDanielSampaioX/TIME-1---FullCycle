from drf_spectacular.utils import extend_schema

from core.api.swagger import PAGINA_INVALIDA, resposta_erro, resposta_validacao
from viagens.serializers import ViagemAssentoSerializer, ViagemSerializer

VIAGEM_NAO_ENCONTRADA = resposta_erro(
    "Viagem não encontrada.", "No Viagem matches the given query."
)

viagens_list_schema = extend_schema(
    summary="Listar viagens disponíveis",
    description=(
        "Retorna as viagens agendadas com partida futura, já com origem, destino, ônibus "
        "e quantidade de assentos livres. Aceita filtros por origem, destino, data, classe, "
        "faixa de preço, período de partida e quantidade de passageiros, além de ordenação "
        "por preço, horário de partida ou duração."
    ),
    tags=["viagens"],
    responses={
        200: ViagemSerializer(many=True),
        400: resposta_validacao(
            "Filtro com valor inválido.",
            {
                "Classe inválida": {
                    "classe": [
                        "Faça uma escolha válida. XYZ não é uma das escolhas disponíveis."
                    ]
                }
            },
        ),
        404: PAGINA_INVALIDA,
    },
)

viagens_detail_schema = extend_schema(
    summary="Detalhar viagem",
    description="Retorna os dados necessários para a tela de detalhes da viagem.",
    tags=["viagens"],
    responses={
        200: ViagemSerializer,
        404: VIAGEM_NAO_ENCONTRADA,
    },
)

viagem_assentos_list_schema = extend_schema(
    summary="Listar assentos da viagem",
    description=(
        "Retorna todos os assentos da viagem, ordenados pelo número, com o status atual "
        "de cada um: DISPONIVEL, SEGURADO ou RESERVADO."
    ),
    tags=["viagens"],
    responses={
        200: ViagemAssentoSerializer(many=True),
        404: VIAGEM_NAO_ENCONTRADA,
    },
)
