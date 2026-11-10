class PagamentoError(Exception):
    pass


class PagamentoNaoPermitidoError(PagamentoError):
    """A reserva não está em condições de receber pagamento."""
