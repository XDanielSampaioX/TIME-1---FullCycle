from django.db import models
from django.db.models import Q

from reservas.models import Reserva


class Pagamento(models.Model):
    class Status(models.TextChoices):
        PENDENTE = "PENDENTE", "Pendente"
        APROVADO = "APROVADO", "Aprovado"
        NEGADO = "NEGADO", "Negado"

    class MetodoPagamento(models.TextChoices):
        PIX = "PIX", "Pix"
        CARTAO = "CARTAO", "Cartão"

    reserva = models.ForeignKey(
        Reserva,
        on_delete=models.PROTECT,
        related_name="pagamentos",
    )
    valor_centavos = models.PositiveIntegerField(
        help_text="Valor cobrado em centavos, copiado de reserva.valor_total.",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDENTE,
    )
    referencia_externa = models.CharField(
        max_length=100,
        blank=True,
        help_text="Identificador da transação no provedor de pagamento.",
    )
    metodo_pagamento = models.CharField(
        max_length=20,
        choices=MetodoPagamento.choices,
    )
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Pagamento"
        verbose_name_plural = "Pagamentos"
        ordering = ("-criado_em",)
        constraints = (
            # Várias tentativas NEGADO são permitidas, mas só uma aprovação.
            models.UniqueConstraint(
                fields=("reserva",),
                condition=Q(status="APROVADO"),
                name="pagamento_aprovado_unico_por_reserva",
            ),
            models.CheckConstraint(
                condition=Q(valor_centavos__gt=0),
                name="pagamento_valor_positivo",
            ),
        )

    def __str__(self):
        return (
            f"Pagamento #{self.pk} - Reserva #{self.reserva_id} "
            f"({self.metodo_pagamento}, {self.status})"
        )
