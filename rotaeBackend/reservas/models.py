from django.conf import settings
from django.db import models

from core.validators import validar_celular, validar_cpf, validar_data_nascimento
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


class Passageiro(models.Model):
    reserva = models.ForeignKey(
        Reserva,
        on_delete=models.CASCADE,
        related_name="passageiros",
    )
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="passageiros",
        help_text="Preenchido quando o passageiro também tem conta no sistema.",
    )
    # Snapshot dos dados do bilhete: obrigatórios mesmo quando há usuário vinculado.
    nome = models.CharField(max_length=150)
    email = models.EmailField()
    celular = models.CharField(max_length=11, validators=[validar_celular])
    data_nasc = models.DateField(validators=[validar_data_nascimento])
    # Sem unique: a mesma pessoa pode viajar em reservas diferentes.
    cpf = models.CharField(max_length=11, validators=[validar_cpf])
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Passageiro"
        verbose_name_plural = "Passageiros"
        ordering = ("id",)

    def __str__(self):
        return f"{self.nome} ({self.cpf}) - Reserva #{self.reserva_id}"
