from drf_spectacular.utils import OpenApiResponse, extend_schema

from pagamentos.serializers import PagamentoCriarSerializer, PagamentoSerializer

pagamento_criar_schema = extend_schema(
    request=PagamentoCriarSerializer,
    responses={
        201: OpenApiResponse(
            response=PagamentoSerializer,
            description="Tentativa registrada e processada (status APROVADO ou NEGADO).",
        ),
        400: OpenApiResponse(description="Método de pagamento inválido."),
        401: OpenApiResponse(description="Não autenticado."),
        404: OpenApiResponse(description="Reserva não encontrada."),
        409: OpenApiResponse(
            description=(
                "Reserva já paga, cancelada, expirada, em FALHA, sem passageiros "
                "cadastrados ou com viagem indisponível/já iniciada."
            )
        ),
    },
    summary="Pagar reserva",
    description=(
        "Processa o pagamento de uma reserva PAGAMENTO_PENDENTE do usuário "
        "autenticado por meio do gateway simulado do MVP. O valor é calculado no "
        "servidor. Se aprovado, a reserva vai para PAGO e os assentos para "
        "RESERVADO. Se negado, a tentativa é registrada; após "
        "3 recusas a reserva vai para FALHA e os assentos são liberados."
    ),
    tags=["pagamentos"],
)
