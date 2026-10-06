from __future__ import annotations

from abc import ABC, abstractmethod
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .models import Viagem


class ViagemValidator(ABC):
    @abstractmethod
    def validar(self, viagem: Viagem, erros: dict):
        pass


class DestinoDiferenteOrigemValidator(ViagemValidator):
    def validar(self, viagem: Viagem, erros: dict):
        if viagem.origem_id == viagem.destino_id:
            erros["destino"] = "O destino deve ser diferente da origem."


class ChegadaAposPartidaValidator(ViagemValidator):
    def validar(self, viagem: Viagem, erros: dict):
        if viagem.chegada_em <= viagem.partida_em:
            erros["chegada_em"] = "A chegada deve ocorrer depois da partida."


class TrocaDeOnibusComAssentosOcupadosValidator(ViagemValidator):
    def _trocou_onibus_com_assentos_ocupados(self, viagem: Viagem) -> bool:
        onibus_atual = viagem.__class__.objects.filter(pk=viagem.pk).values_list("onibus_id", flat=True).first()
        if onibus_atual is None or onibus_atual == viagem.onibus_id:
            return False

        return viagem.viagem_assentos.exclude(status="DISPONIVEL").exists()

    def validar(self, viagem: Viagem, erros: dict):
        if viagem.pk and self._trocou_onibus_com_assentos_ocupados(viagem):
            erros["onibus"] = "Não é possível trocar o ônibus de uma viagem com assentos segurados ou reservados."
