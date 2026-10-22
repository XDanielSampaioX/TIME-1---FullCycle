from rest_framework import serializers

from viagens.models import ViagemAssento
from viagens.serializers import ViagemSerializer
from .models import Reserva


class ReservaCriarSerializer(serializers.Serializer):
    viagem_id = serializers.IntegerField()
    viagem_assento_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        min_length=1,
        max_length=10,
    )

    def validate(self, attrs):
        ids = attrs.get("viagem_assento_ids")
        if not ids:
            raise serializers.ValidationError({"viagem_assento_ids": "Informe ao menos um assento para reservar."})

        if len(ids) != len(set(ids)):
            raise serializers.ValidationError("A lista contém assentos duplicados.")

        return attrs


class ReservaViagemAssentoSerializer(serializers.ModelSerializer):
    assento_id = serializers.IntegerField(read_only=True)
    numero = serializers.IntegerField(source="assento.numero", read_only=True)

    class Meta:
        model = ViagemAssento
        fields = ("id", "assento_id", "numero", "status")
        read_only_fields = fields


class ReservaSerializer(serializers.ModelSerializer):
    viagem = ViagemSerializer(read_only=True)
    assentos = ReservaViagemAssentoSerializer(source="viagem_assentos", many=True, read_only=True)
    total_assentos = serializers.SerializerMethodField()

    class Meta:
        model = Reserva
        fields = (
            "id",
            "viagem",
            "status",
            "valor_total",
            "expira_em",
            "assentos",
            "total_assentos",
            "criado_em",
            "atualizado_em",
        )
        read_only_fields = fields

    def get_total_assentos(self, obj):
        return len(obj.viagem_assentos.all())