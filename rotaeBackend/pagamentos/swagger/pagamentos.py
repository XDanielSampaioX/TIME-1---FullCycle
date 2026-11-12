from drf_spectacular.utils import OpenApiExample, extend_schema

from core.api.swagger import NAO_AUTENTICADO, resposta_erro, resposta_validacao
from pagamentos.serializers import PagamentoCriarSerializer, PagamentoSerializer
from pagamentos.services import MAX_TENTATIVAS_PAGAMENTO

pagamento_criar_schema = extend_schema(
    request=PagamentoCriarSerializer,
    examples=[
        OpenApiExample("Pix", value={"metodoPagamento": "PIX"}, request_only=True),
        OpenApiExample(
            "Cartão", value={"metodoPagamento": "CARTAO"}, request_only=True
        ),
    ],
    responses={
        201: PagamentoSerializer,
        400: resposta_validacao(
            "Método de pagamento ausente ou inválido.",
            {
                "Método inválido": {
                    "metodoPagamento": ['"BOLETO" não é uma escolha válida.']
                }
            },
        ),
        401: NAO_AUTENTICADO,
        404: resposta_erro(
            "Reserva não encontrada ou pertencente a outro usuário.",
            "Reserva não encontrada.",
        ),
        409: resposta_erro(
            "Reserva já paga, cancelada, expirada, em FALHA, sem valor, sem "
            "passageiros cadastrados, com viagem indisponível/já iniciada ou com "
            "outro pagamento em processamento.",
            "Reserva não aceita pagamento (status: PAGO).",
            "Reserva expirada.",
            "Cadastre os passageiros de todos os assentos antes de pagar.",
            "Viagem indisponível ou já iniciada.",
            "Já existe um pagamento em processamento para esta reserva.",
        ),
        502: resposta_erro(
            "O provedor de pagamento falhou; a tentativa conta como recusada.",
            "Provedor de pagamento indisponível. Tente novamente.",
        ),
    },
    summary="Pagar reserva",
    description=(
        "Processa o pagamento de uma reserva PAGAMENTO_PENDENTE do usuário "
        "autenticado por meio do gateway simulado do MVP. O valor é calculado no "
        "servidor. A resposta 201 traz a tentativa com status APROVADO (reserva vai "
        "para PAGO e assentos para RESERVADO) ou NEGADO (a reserva continua "
        f"pendente; após {MAX_TENTATIVAS_PAGAMENTO} recusas vai para FALHA e os "
        "assentos são liberados)."
    ),
    tags=["pagamentos"],
)
