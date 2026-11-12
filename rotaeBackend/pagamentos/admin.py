from django.contrib import admin

from .models import Pagamento


@admin.register(Pagamento)
class PagamentoAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "reserva",
        "metodo_pagamento",
        "status",
        "valor_centavos",
        "referencia_externa",
        "criado_em",
    )
    list_filter = ("status", "metodo_pagamento", "criado_em")
    search_fields = ("referencia_externa", "reserva__id", "reserva__usuario__email")
    list_select_related = (
        "reserva__usuario",
        "reserva__viagem__origem",
        "reserva__viagem__destino",
    )

    # Pagamentos só nascem pela API; o admin serve para consulta e auditoria.
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
