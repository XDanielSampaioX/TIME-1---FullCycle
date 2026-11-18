from rest_framework import serializers

from viagens.models import Viagem, ViagemAssento
from viagens.serializers import CidadeSerializer, ViagemSerializer

from .models import Passageiro, Passagem, Reserva


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


class PassagemViagemAssentoSerializer(serializers.ModelSerializer):
    numero = serializers.IntegerField(source="assento.numero", read_only=True)

    class Meta:
        model = ViagemAssento
        fields = ("id", "numero")
        read_only_fields = fields


class PassagemResumoSerializer(serializers.ModelSerializer):
    viagem_assento_id = serializers.IntegerField(read_only=True)
    passageiro_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Passagem
        fields = ("id", "viagem_assento_id", "passageiro_id", "status")
        read_only_fields = fields


class PassagemViagemResumoSerializer(serializers.ModelSerializer):
    origem = CidadeSerializer(read_only=True)
    destino = CidadeSerializer(read_only=True)

    class Meta:
        model = Viagem
        fields = ("origem", "destino", "partida_em", "chegada_em")
        read_only_fields = fields


class PassagemSerializer(serializers.ModelSerializer):
    reserva_id = serializers.IntegerField(read_only=True)
    viagem = PassagemViagemResumoSerializer(source="reserva.viagem", read_only=True)
    viagem_assento = PassagemViagemAssentoSerializer(read_only=True)
    passageiro = PassageiroSerializer(read_only=True)

    class Meta:
        model = Passagem
        fields = (
            "id",
            "reserva_id",
            "viagem",
            "viagem_assento",
            "passageiro",
            "status",
            "criado_em",
            "atualizado_em",
        )
        read_only_fields = fields


class ReservaViagemAssentoSerializer(serializers.ModelSerializer):
    numero = serializers.IntegerField(source="assento.numero", read_only=True)

    class Meta:
        model = ViagemAssento
        fields = ("id", "numero", "status")
        read_only_fields = fields


class ReservaSerializer(serializers.ModelSerializer):
    viagem = ViagemSerializer(read_only=True)
    assentos = ReservaViagemAssentoSerializer(
        source="viagem_assentos", many=True, read_only=True
    )
    passageiros = serializers.SlugRelatedField(
        many=True, read_only=True, slug_field="nome"
    )
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
            "passageiros",
            "total_assentos",
            "criado_em",
            "atualizado_em",
        )
        read_only_fields = fields

    def get_total_assentos(self, obj) -> int:
        return len(obj.viagem_assentos.all())


class ReservaDetalheSerializer(ReservaSerializer):
    passageiros = PassageiroSerializer(many=True, read_only=True)
    passagens = PassagemResumoSerializer(many=True, read_only=True)

    class Meta(ReservaSerializer.Meta):
        fields = ReservaSerializer.Meta.fields + ("passagens",)
