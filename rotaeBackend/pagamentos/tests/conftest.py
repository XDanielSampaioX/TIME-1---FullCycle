from datetime import date

import pytest

from reservas.models import Passageiro
from reservas.services import criar_reserva

# Reaproveita as fixtures de viagem e do segundo usuário do app de reservas.
from reservas.tests.conftest import (  # noqa: F401
    fortaleza,
    onibus,
    outro_cliente,
    outro_token,
    outro_usuario,
    sobral,
    viagem,
)


def cadastrar_passageiros_para(reserva):
    """Cria um passageiro por assento da reserva, direto no banco."""
    total = reserva.viagem_assentos.count()
    Passageiro.objects.bulk_create(
        Passageiro(
            reserva=reserva,
            nome=f"Passageiro {i}",
            email=f"passageiro{i}@email.com",
            celular="85999990000",
            data_nasc=date(1990, 1, 1),
            cpf=f"{i:011d}",
        )
        for i in range(1, total + 1)
    )


@pytest.fixture
def reserva_sem_passageiros(usuario, viagem):  # noqa: F811
    ids = list(viagem.viagem_assentos.order_by("pk").values_list("id", flat=True)[:2])
    return criar_reserva(usuario=usuario, viagem_id=viagem.id, viagem_assento_ids=ids)


@pytest.fixture
def reserva(reserva_sem_passageiros):
    """Reserva PAGAMENTO_PENDENTE com 2 assentos e passageiros cadastrados."""
    cadastrar_passageiros_para(reserva_sem_passageiros)
    return reserva_sem_passageiros
