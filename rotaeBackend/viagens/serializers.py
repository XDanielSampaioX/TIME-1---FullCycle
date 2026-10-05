from rest_framework import serializers

from .models import Cidade, Onibus, Viagem, ViagemAssento


class CidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cidade
        fields = ("id", "nome", "uf", "imagem_url",)


class OnibusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Onibus
        fields = ("id", "identificacao", "modelo", "total_assentos",)


class ViagemSerializer(serializers.ModelSerializer):
    origem = CidadeSerializer(read_only=True)
    destino = CidadeSerializer(read_only=True)
    onibus = OnibusSerializer(read_only=True)
    assentos_livres = serializers.IntegerField(read_only=True)

    class Meta:
        model = Viagem
        fields = (
            "id",
            "origem",
            "destino",
            "onibus",
            "classe",
            "partida_em",
            "chegada_em",
            "duracao",
            "preco_centavos",
            "status",
            "assentos_livres",
        )


class ViagemAssentoSerializer(serializers.ModelSerializer):
    viagem_id = serializers.IntegerField(read_only=True)
    assento_id = serializers.IntegerField(read_only=True)
    numero = serializers.IntegerField(source="assento.numero", read_only=True)

    class Meta:
        model = ViagemAssento
        fields = ("id", "viagem_id", "assento_id", "numero", "status",)
