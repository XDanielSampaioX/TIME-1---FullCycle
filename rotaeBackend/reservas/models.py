from django.conf import settings
from django.db import models

from viagens.models import Viagem


class Reserva(models.Model):
    class Status(models.TextChoices):
        PAGAMENTO_PENDENTE = "PAGAMENTO_PENDENTE", "Pagamento Pendente"
        PAGO = "PAGO", "Pago"
        EXPIRADO = "EXPIRADO", "Expirado"
        FALHA = "FALHA", "Falha"
        CANCELADO = "CANCELADO", "Cancelado"

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="reservas",
    )
    viagem = models.ForeignKey(
        Viagem,
        on_delete=models.PROTECT,
        related_name="reservas",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PAGAMENTO_PENDENTE,
    )
    valor_total = models.PositiveIntegerField(
        help_text="Valor total da reserva em centavos.",
    )
    expira_em = models.DateTimeField(
        help_text="Data e hora em que a reserva expira se não for paga.",
    )
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Reserva"
        verbose_name_plural = "Reservas"
        ordering = ("-criado_em",)

    def __str__(self):
        return f"Reserva #{self.pk} - {self.usuario} - {self.viagem} ({self.status})"
