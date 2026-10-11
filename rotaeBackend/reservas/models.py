from django.conf import settings
from django.db import models
from viagens.models import Viagem, Assento, ViagemAssento


class Reserva(models.Model):
    class Status(models.TextChoices):
        PENDENTE = "PENDENTE", "Pendente"
        CONFIRMADA = "CONFIRMADA", "Confirmada"
        CANCELADA = "CANCELADA", "Cancelada"

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reservas",
    )
    viagem = models.ForeignKey(
        Viagem,
        on_delete=models.CASCADE,
        related_name="reservas",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDENTE,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Reserva"
        verbose_name_plural = "Reservas"

    def __str__(self):
        return f"Reserva #{self.pk} - {self.usuario} - {self.viagem} ({self.status})"


class ReservaAssento(models.Model):
    reserva = models.ForeignKey(
        Reserva,
        on_delete=models.CASCADE,
        related_name="assentos",
    )
    assento = models.ForeignKey(
        Assento,
        on_delete=models.CASCADE,
        related_name="reservas",
    )
    preco_centavos = models.PositiveIntegerField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["reserva", "assento"],
                name="unique_reserva_assento",
            ),
        ]
        verbose_name = "Assento da Reserva"
        verbose_name_plural = "Assentos da Reserva"

    def __str__(self):
        return f"ReservaAssento #{self.pk} - Reserva {self.reserva_id} - Assento {self.assento_id}"
