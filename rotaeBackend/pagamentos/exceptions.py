class PagamentoError(Exception):
    pass


class PagamentoNaoPermitidoError(PagamentoError):
    """A reserva não está em condições de receber pagamento."""


class GatewayIndisponivelError(PagamentoError):
    """O provedor de pagamento não respondeu ou falhou."""
