from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import serializers

from reservas.serializers import ReservaCriarSerializer, ReservaSerializer


class AssentoIndisponivelResponseSerializer(serializers.Serializer):
    detail = serializers.CharField()
    assentos_indisponiveis = serializers.ListField(
        child=serializers.DictField(),
        required=False,
    )


reserva_criar_schema = extend_schema(
    request=ReservaCriarSerializer,
    responses={
        201: ReservaSerializer,
        400: OpenApiResponse(
            response=AssentoIndisponivelResponseSerializer,
            description="Viagem não disponível ou assento de outra viagem."
        ),
        401: OpenApiResponse(description="Não autenticado."),
        409: OpenApiResponse(
            response=AssentoIndisponivelResponseSerializer,
            description="Um ou mais assentos já estão reservados."
        ),
    },
    summary="Criar reserva com bloqueio temporário",
    description=(
        "Cria uma reserva para a viagem e assentos informados. "
        "Os assentos são bloqueados via select_for_update() no banco de dados. "
        "Se qualquer assento não estiver disponível, retorna 409 com a lista de assentos indisponíveis. "
        "Se o assento não pertencer à viagem, retorna 400."
    ),
    tags=["reservas"],
)

reserva_detalhe_schema = extend_schema(
    responses={
        200: ReservaSerializer,
        401: OpenApiResponse(description="Não autenticado."),
        404: OpenApiResponse(description="Reserva não encontrada."),
    },
    summary="Obter detalhes de uma reserva",
    description="Retorna os detalhes completos de uma reserva pertencente ao usuário autenticado.",
    tags=["reservas"],
)

reserva_cancelar_schema = extend_schema(
    request=None,
    responses={
        200: ReservaSerializer,
        400: OpenApiResponse(description="Reserva não pode ser cancelada (status inválido)."),
        401: OpenApiResponse(description="Não autenticado."),
        404: OpenApiResponse(description="Reserva não encontrada."),
    },
    summary="Cancelar reserva",
    description=(
        "Cancela uma reserva com status PAGAMENTO_PENDENTE do usuário autenticado "
        "e libera os assentos associados de volta para DISPONIVEL."
    ),
    tags=["reservas"],
)

reserva_minhas_reservas_schema = extend_schema(
    responses={
        200: ReservaSerializer(many=True),
        401: OpenApiResponse(description="Não autenticado."),
    },
    summary="Listar reservas do usuário autenticado",
    description="Retorna todas as reservas realizadas pelo usuário autenticado, ordenadas pela mais recente.",
    tags=["reservas"],
)