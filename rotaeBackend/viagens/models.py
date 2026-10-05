from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Count, F, Q
from django.utils import timezone


class Cidade(models.Model):
    nome = models.CharField(max_length=100)
    uf = models.CharField(max_length=2)
    imagem_url = models.ImageField(upload_to="cidades", blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Cidades"
        ordering = ("nome",)

    def __str__(self):
        return f"{self.nome} - {self.uf}"


class Onibus(models.Model):
    identificacao = models.CharField(max_length=20, unique=True)
    total_assentos = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    modelo = models.CharField(max_length=100, blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Ônibus"
        verbose_name_plural = "Ônibus"
        ordering = ("identificacao",)

    def __str__(self):
        return self.identificacao


class Assento(models.Model):
    onibus = models.ForeignKey(Onibus, on_delete=models.CASCADE, related_name="assentos")
    numero = models.PositiveIntegerField(validators=[MinValueValidator(1)])

    class Meta:
        ordering = ("onibus", "numero")
        constraints = (
            models.UniqueConstraint(fields=("onibus", "numero"), name="assento_numero_unico_por_onibus"),
        )

    def __str__(self):
        return f"{self.onibus} - Assento {self.numero}"


class ViagemQuerySet(models.QuerySet):
    def disponiveis_para_venda(self):
        return self.filter(status=Viagem.Status.AGENDADA, partida_em__gt=timezone.now())

    def com_assentos_livres(self):
        return self.annotate(
            assentos_livres=Count(
                "viagem_assentos",
                filter=Q(viagem_assentos__status=ViagemAssento.Status.DISPONIVEL),
            )
        )


class Viagem(models.Model):
    class Classe(models.TextChoices):
        CONVENCIONAL = "CONVENCIONAL", "Convencional"
        EXECUTIVA = "EXECUTIVA", "Executiva"

    class Status(models.TextChoices):
        AGENDADA = "AGENDADA", "Agendada"
        COMPLETADA = "COMPLETADA", "Completada"
        CANCELADA = "CANCELADA", "Cancelada"

    onibus = models.ForeignKey(Onibus, on_delete=models.PROTECT, related_name="viagens")
    origem = models.ForeignKey(Cidade, on_delete=models.PROTECT, related_name="viagens_origem")
    destino = models.ForeignKey(Cidade, on_delete=models.PROTECT, related_name="viagens_destino")
    classe = models.CharField(max_length=20, choices=Classe.choices)
    partida_em = models.DateTimeField()
    chegada_em = models.DateTimeField()
    duracao = models.PositiveIntegerField(editable=False, help_text="Duração estimada em minutos.")
    preco_centavos = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AGENDADA)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    objects = ViagemQuerySet.as_manager()

    class Meta:
        verbose_name_plural = "Viagens"
        ordering = ("partida_em",)
        indexes = (
            models.Index(fields=("origem", "destino", "partida_em"), name="viagem_busca_idx"),
        )
        constraints = (
            models.CheckConstraint(condition=~Q(origem=F("destino")), name="viagem_origem_diferente_destino"),
            models.CheckConstraint(condition=Q(chegada_em__gt=F("partida_em")), name="viagem_chegada_apos_partida"),
        )

    def __str__(self):
        partida = timezone.localtime(self.partida_em).strftime("%d/%m/%Y %H:%M")
        return f"{self.origem} → {self.destino} ({partida})"

    def clean(self):
        erros = {}
        if self.origem_id and self.origem_id == self.destino_id:
            erros["destino"] = "O destino deve ser diferente da origem."
        if self.partida_em and self.chegada_em and self.chegada_em <= self.partida_em:
            erros["chegada_em"] = "A chegada deve ocorrer depois da partida."
        if self.pk and self._trocou_onibus_com_assentos_ocupados():
            erros["onibus"] = "Não é possível trocar o ônibus de uma viagem com assentos segurados ou reservados."
        if erros:
            raise ValidationError(erros)

    def save(self, *args, **kwargs):
        if self.partida_em and self.chegada_em:
            minutos = (self.chegada_em - self.partida_em).total_seconds() // 60
            self.duracao = max(int(minutos), 0)
        super().save(*args, **kwargs)

    def _trocou_onibus_com_assentos_ocupados(self):
        onibus_atual = Viagem.objects.filter(pk=self.pk).values_list("onibus_id", flat=True).first()
        if onibus_atual is None or onibus_atual == self.onibus_id:
            return False
        return self.viagem_assentos.exclude(status=ViagemAssento.Status.DISPONIVEL).exists()


class ViagemAssento(models.Model):
    class Status(models.TextChoices):
        DISPONIVEL = "DISPONIVEL", "Disponível"
        SEGURADO = "SEGURADO", "Segurado"
        RESERVADO = "RESERVADO", "Reservado"

    viagem = models.ForeignKey(Viagem, on_delete=models.CASCADE, related_name="viagem_assentos")
    assento = models.ForeignKey(Assento, on_delete=models.PROTECT, related_name="viagem_assentos")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DISPONIVEL)

    class Meta:
        verbose_name = "Assento da viagem"
        verbose_name_plural = "Assentos das viagens"
        ordering = ("viagem", "assento__numero")
        constraints = (
            models.UniqueConstraint(fields=("viagem", "assento"), name="viagem_assento_unico"),
        )

    def __str__(self):
        return f"{self.viagem} - Assento {self.assento.numero} ({self.status})"

    def clean(self):
        if self.viagem_id and self.assento_id and self.assento.onibus_id != self.viagem.onibus_id:
            raise ValidationError({"assento": "O assento deve pertencer ao ônibus da viagem."})
