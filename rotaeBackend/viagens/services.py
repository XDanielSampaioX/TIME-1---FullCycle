from django.core.exceptions import ValidationError
from django.db import transaction

from .models import Assento, Onibus, Viagem, ViagemAssento


@transaction.atomic
def criar_assentos_do_onibus(onibus: Onibus) -> None:
    """Cria os assentos físicos que ainda faltam, numerados de 1 até total_assentos."""
    existentes = set(onibus.assentos.values_list("numero", flat=True))
    Assento.objects.bulk_create(
        Assento(onibus=onibus, numero=numero)
        for numero in range(1, onibus.total_assentos + 1)
        if numero not in existentes
    )


@transaction.atomic
def gerar_assentos_da_viagem(viagem: Viagem) -> None:
    """Garante um ViagemAssento para cada assento do ônibus escalado na viagem.

    Os novos registros começam como DISPONIVEL. Se a viagem trocou de ônibus, os
    registros do ônibus anterior são removidos. Pode ser executado mais de uma vez.
    """
    criar_assentos_do_onibus(viagem.onibus)

    de_outro_onibus = viagem.viagem_assentos.exclude(assento__onibus=viagem.onibus)
    if de_outro_onibus.exclude(status=ViagemAssento.Status.DISPONIVEL).exists():
        raise ValidationError(
            "Não é possível trocar o ônibus de uma viagem com assentos segurados ou reservados."
        )
    de_outro_onibus.delete()

    ViagemAssento.objects.bulk_create(
        [ViagemAssento(viagem=viagem, assento=assento) for assento in viagem.onibus.assentos.all()],
        ignore_conflicts=True,
    )
