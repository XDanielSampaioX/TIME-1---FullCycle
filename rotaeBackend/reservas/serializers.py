from rest_framework import serializers

from .models import Reserva, ReservaAssento
from .services import (
    AssentoIndisponivelError,
    ViagemNaoEncontradaError,
    criar_reserva,
)


class ReservaCriarSerializer(serializers.Serializer):
    viagem_id = serializers.IntegerField()
    assento_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        min_length=1,
    )

    def validate_assento_ids(self, value):
        duplicados = len(value) != len(set(value))
        if duplicados:
            raise serializers.ValidationError("A lista contém assentos duplicados.")
        return value

    def create(self, validated_data):
        return criar_reserva(
            usuario=self.context["request"].user,
            viagem_id=validated_data["viagem_id"],
            assento_ids=validated_data["assento_ids"],
        )


class ReservaAssentoSerializer(serializers.ModelSerializer):
    numero = serializers.IntegerField(source="assento.numero", read_only=True)

    class Meta:
        model = ReservaAssento
        fields = ["id", "assento", "numero", "preco_centavos"]


class ReservaSerializer(serializers.ModelSerializer):
    assentos = ReservaAssentoSerializer(many=True, read_only=True)
    viagem_id = serializers.IntegerField(source="viagem.id", read_only=True)

    class Meta:
        model = Reserva
        fields = [
            "id",
            "usuario",
            "viagem",
            "viagem_id",
            "status",
            "expira_em",
            "assentos",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields