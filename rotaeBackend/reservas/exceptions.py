class ReservaError(Exception):
    pass


class AssentoIndisponivelError(ReservaError):
    def __init__(self, message, assentos_indisponiveis=None):
        super().__init__(message)
        self.assentos_indisponiveis = assentos_indisponiveis or []


class AssentoOutraViagemError(ReservaError):
    def __init__(self, message, assentos_indisponiveis=None):
        super().__init__(message)
        self.assentos_indisponiveis = assentos_indisponiveis or []


class ViagemNaoEncontradaError(ReservaError):
    pass


class ReservaNaoEncontradaError(ReservaError):
    pass


class ReservaInvalidaError(ReservaError):
    pass

