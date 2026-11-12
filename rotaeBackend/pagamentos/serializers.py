from rest_framework import serializers

from .models import Pagamento


class PagamentoCriarSerializer(serializers.Serializer):
    metodo_pagamento = serializers.ChoiceField(
        choices=Pagamento.MetodoPagamento.choices
    )


class PagamentoSerializer(serializers.ModelSerializer):
    reserva_id = serializers.IntegerField(read_only=True)
    reserva_status = serializers.CharField(source="reserva.status", read_only=True)

    class Meta:
        model = Pagamento
        fields = (
            "id",
            "reserva_id",
            "reserva_status",
            "valor_centavos",
            "status",
            "metodo_pagamento",
            "referencia_externa",
            "criado_em",
            "atualizado_em",
        )
        read_only_fields = fields
