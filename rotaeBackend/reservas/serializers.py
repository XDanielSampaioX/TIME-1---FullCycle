from rest_framework import serializers

from viagens.models import ViagemAssento
from viagens.serializers import ViagemSerializer
from .models import Passageiro, Reserva


class ReservaCriarSerializer(serializers.Serializer):
    viagem_id = serializers.IntegerField()
    viagem_assento_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        min_length=1,
        max_length=10,
    )

    def validate_viagem_assento_ids(self, value):
        if len(value) != len(set(value)):
            raise serializers.ValidationError("A lista contém assentos duplicados.")
        return value


class PassageirosCriarListSerializer(serializers.ListSerializer):
    def validate(self, attrs):
        cpfs = [passageiro["cpf"] for passageiro in attrs]
        if len(cpfs) != len(set(cpfs)):
            raise serializers.ValidationError("A lista contém CPFs duplicados.")
        return attrs


class PassageiroCriarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Passageiro
        fields = ("nome", "email", "celular", "data_nasc", "cpf")
        list_serializer_class = PassageirosCriarListSerializer


class PassageiroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Passageiro
        fields = (
            "id",
            "usuario_id",
            "nome",
            "email",
            "celular",
            "data_nasc",
            "cpf",
            "criado_em",
            "atualizado_em",
        )
        read_only_fields = fields


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
    passageiros = PassageiroSerializer(many=True, read_only=True)

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
            "passageiros",
            "criado_em",
            "atualizado_em",
        )
        read_only_fields = fields

    def get_total_assentos(self, obj):
        return len(obj.viagem_assentos.all())