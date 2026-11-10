from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema
from rest_framework import serializers

from core.api.swagger import (
    NAO_AUTENTICADO,
    PAGINA_INVALIDA,
    resposta_erro,
)
from reservas.serializers import (
    ReservaCriarSerializer,
    ReservaDetalheSerializer,
    ReservaSerializer,
)


class AssentoIndisponivelResponseSerializer(serializers.Serializer):
    detail = serializers.CharField()
    assentos = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
    )


RESERVA_NAO_ENCONTRADA = resposta_erro(
    "Reserva não encontrada ou pertencente a outro usuário.",
    "Reserva não encontrada.",
)

reserva_criar_schema = extend_schema(
    request=ReservaCriarSerializer,
    responses={
        201: ReservaSerializer,
        400: OpenApiResponse(
            response=AssentoIndisponivelResponseSerializer,
            description=(
                "Viagem não disponível, assento de outra viagem ou erro de validação "
                "dos campos (ex.: assentos duplicados)."
            ),
            examples=[
                OpenApiExample(
                    "Viagem indisponível",
                    value={
                        "detail": "Viagem com id=7 não encontrada ou não disponível "
                        "para venda."
                    },
                ),
                OpenApiExample(
                    "Assento de outra viagem",
                    value={
                        "detail": "Um ou mais assentos informados não pertencem à "
                        "viagem.",
                        "assentos": [42],
                    },
                ),
                OpenApiExample(
                    "Assentos duplicados",
                    value={"viagemAssentoIds": ["A lista contém assentos duplicados."]},
                ),
            ],
        ),
        401: NAO_AUTENTICADO,
        409: OpenApiResponse(
            response=AssentoIndisponivelResponseSerializer,
            description="Um ou mais assentos já estão reservados.",
            examples=[
                OpenApiExample(
                    "Assentos ocupados",
                    value={
                        "detail": "Um ou mais assentos já estão reservados.",
                        "assentos": [12, 13],
                    },
                )
            ],
        ),
    },
    summary="Criar reserva com bloqueio temporário",
    description="Cria uma reserva para a viagem e assentos informados.",
    tags=["reservas"],
)

reserva_detalhe_schema = extend_schema(
    responses={
        200: ReservaDetalheSerializer,
        401: NAO_AUTENTICADO,
        404: resposta_erro(
            "Reserva não encontrada ou pertencente a outro usuário.",
            "No Reserva matches the given query.",
        ),
    },
    summary="Obter detalhes de uma reserva",
    description="Retorna os detalhes completos de uma reserva pertencente ao usuário autenticado.",
    tags=["reservas"],
)

reserva_cancelar_schema = extend_schema(
    request=None,
    responses={
        200: ReservaSerializer,
        400: resposta_erro(
            "Reserva não pode ser cancelada (status inválido).",
            "Reserva não pode ser cancelada (status: PAGO).",
        ),
        401: NAO_AUTENTICADO,
        404: RESERVA_NAO_ENCONTRADA,
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
        401: NAO_AUTENTICADO,
        404: PAGINA_INVALIDA,
    },
    summary="Listar reservas do usuário autenticado",
    description="Retorna todas as reservas realizadas pelo usuário autenticado, ordenadas pela mais recente.",
    tags=["reservas"],
)
