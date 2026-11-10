from abc import ABC, abstractmethod
from dataclasses import dataclass
from uuid import uuid4


@dataclass(frozen=True)
class ResultadoGateway:
    aprovado: bool
    referencia_externa: str


class GatewayPagamento(ABC):
    """
    Contrato com o provedor de pagamento.
    O service depende só desta abstração; trocar o simulado por um gateway real
    (ex.: Mercado Pago) não muda as regras de domínio.
    """

    @abstractmethod
    def processar(self, *, valor_centavos, metodo_pagamento) -> ResultadoGateway:
        raise NotImplementedError


class GatewaySimulado(GatewayPagamento):
    """
    Provedor fictício do MVP: não faz chamadas externas e responde na hora.
    Aprova por padrão; `aprovar=False` simula recusa (útil em testes).
    """

    def __init__(self, *, aprovar=True):
        self.aprovar = aprovar

    def processar(self, *, valor_centavos, metodo_pagamento) -> ResultadoGateway:
        return ResultadoGateway(
            aprovado=self.aprovar,
            referencia_externa=f"SIM-{metodo_pagamento}-{uuid4().hex[:16].upper()}",
        )


def obter_gateway() -> GatewayPagamento:
    return GatewaySimulado()
