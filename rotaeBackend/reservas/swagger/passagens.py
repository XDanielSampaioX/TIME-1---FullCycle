from drf_spectacular.utils import extend_schema

from core.api.swagger import NAO_AUTENTICADO, PAGINA_INVALIDA, resposta_erro
from reservas.serializers import PassagemSerializer

PASSAGEM_NAO_ENCONTRADA = resposta_erro(
    "Passagem não encontrada ou pertencente a outro usuário.",
    "No Passagem matches the given query.",
)

passagem_minhas_passagens_schema = extend_schema(
    responses={
        200: PassagemSerializer(many=True),
        401: NAO_AUTENTICADO,
        404: PAGINA_INVALIDA,
    },
    summary="Listar passagens do usuário autenticado",
    description="Retorna as passagens emitidas para reservas do usuário autenticado.",
    tags=["passagens"],
)

passagem_detalhe_schema = extend_schema(
    responses={
        200: PassagemSerializer,
        401: NAO_AUTENTICADO,
        404: PASSAGEM_NAO_ENCONTRADA,
    },
    summary="Obter uma passagem",
    description="Retorna uma passagem pertencente ao usuário autenticado.",
    tags=["passagens"],
)
