from datetime import timedelta

from django.db import connection, transaction
from django.utils import timezone

from viagens.models import Viagem, ViagemAssento
from .models import Reserva, ReservaAssento


# TTL padrão para bloqueio temporário (15 minutos)
RESERVA_TTL_MINUTOS = 15


class AssentoIndisponivelError(Exception):
    """Um ou mais assentos solicitados não estão disponíveis."""

    def __init__(self, assentos_ids):
        self.assentos_ids = assentos_ids
        super().__init__(f"Assentos indisponíveis: {assentos_ids}")


class ViagemNaoEncontradaError(Exception):
    """A viagem informada não foi encontrada."""


def _select_for_update_kwargs():
    """Retorna os kwargs adequados de select_for_update para o backend atual.

    PostgreSQL suporta nowait=True (falha imediata se a linha estiver travada).
    SQLite serializa escritas e não aceita nowait, mas o lock pessimista com
    transaction.atomic() é suficiente para testes.
    """
    if connection.vendor == "postgresql":
        return {"nowait": True}
    return {}


def criar_reserva(*, usuario, viagem_id, assento_ids):
    """
    Cria uma reserva com bloqueio temporário dos assentos usando
    select_for_update(nowait=True) para proteção contra concorrência.

    Fluxo:
    1. Valida a viagem e assentos sem lock
    2. Adquire lock determinístico (ORDER BY pk) na Viagem + ViagemAssento
    3. Revalida após lock (double-check)
    4. Marca assentos como SEGURADO (bulk_update)
    5. Cria Reserva + ReservaAssento (bulk_create)
    6. Retorna a reserva criada

    Levanta:
    - ViagemNaoEncontradaError se a viagem não existe
    - AssentoIndisponivelError se um assento não está DISPONIVEL (HTTP 409)
    - DatabaseError (nowait) se outra transação já travou a mesma linha
    """
    # --- Validação inicial (sem lock) ---
    try:
        viagem = Viagem.objects.get(pk=viagem_id)
    except Viagem.DoesNotExist:
        raise ViagemNaoEncontradaError(f"Viagem com id={viagem_id} não encontrada.")

    assento_ids_ordenados = sorted(set(assento_ids))
    if not assento_ids_ordenados:
        raise AssentoIndisponivelError([])

    lock_kwargs = _select_for_update_kwargs()

    with transaction.atomic():
        # --- Lock determinístico: Viagem + ViagemAssento ordenados por pk ---
        viagem = (
            Viagem.objects
            .select_for_update(**lock_kwargs)
            .get(pk=viagem_id)
        )

        viagem_assentos = list(
            ViagemAssento.objects
            .select_for_update(**lock_kwargs)
            .filter(viagem=viagem, assento_id__in=assento_ids_ordenados)
            .select_related("assento")
            .order_by("pk")
        )

        # --- Revalidação pós-lock ---
        if len(viagem_assentos) != len(assento_ids_ordenados):
            encontrados = {va.assento_id for va in viagem_assentos}
            faltantes = set(assento_ids_ordenados) - encontrados
            raise AssentoIndisponivelError(sorted(faltantes))

        # Verifica se todos os assentos pertencem à viagem correta
        # (já filtrado pelo query, mas validação extra de segurança)
        for va in viagem_assentos:
            if va.viagem_id != viagem_id:
                raise AssentoIndisponivelError([va.assento_id])

        indisponiveis = [
            va.assento_id for va in viagem_assentos
            if va.status != ViagemAssento.Status.DISPONIVEL
        ]
        if indisponiveis:
            raise AssentoIndisponivelError(sorted(indisponiveis))

        # --- Criar Reserva ---
        expira_em = timezone.now() + timedelta(minutes=RESERVA_TTL_MINUTOS)
        reserva = Reserva.objects.create(
            usuario=usuario,
            viagem=viagem,
            status=Reserva.Status.PENDENTE,
            expira_em=expira_em,
        )

        # --- Marcar assentos como SEGURADO ---
        precos = []
        reserva_assentos = []
        for va in viagem_assentos:
            va.status = ViagemAssento.Status.SEGURADO
            precos.append(viagem.preco_centavos)
            reserva_assentos.append(
                ReservaAssento(
                    reserva=reserva,
                    assento=va.assento,
                    preco_centavos=viagem.preco_centavos,
                )
            )

        ViagemAssento.objects.bulk_update(viagem_assentos, ["status"])
        ReservaAssento.objects.bulk_create(reserva_assentos)

    return reserva