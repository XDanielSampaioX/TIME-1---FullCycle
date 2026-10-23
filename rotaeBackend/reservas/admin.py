from django.contrib import admin

from viagens.models import ViagemAssento
from .models import Reserva
from .services import cancelar_reserva, ReservaInvalidaError


class ViagemAssentoInline(admin.TabularInline):
    model = ViagemAssento
    extra = 0
    fields = ("assento", "status")
    readonly_fields = ("assento", "status")
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "usuario",
        "viagem",
        "status",
        "valor_total",
        "expira_em",
        "criado_em",
        "atualizado_em",
    )
    list_filter = ("status", "criado_em")
    search_fields = (
        "usuario__email",
        "usuario__nome",
        "viagem__origem__nome",
        "viagem__destino__nome",
    )
    list_select_related = ("usuario", "viagem")
    inlines = (ViagemAssentoInline,)
    actions = ("cancelar_reservas",)

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    @admin.action(description="Cancelar reservas selecionadas")
    def cancelar_reservas(self, request, queryset):
        canceladas = 0
        erros = 0
        for reserva in queryset:
            try:
                cancelar_reserva(reserva_id=reserva.id, usuario=reserva.usuario)
                canceladas += 1
            except ReservaInvalidaError:
                erros += 1
        if canceladas:
            self.message_user(request, f"{canceladas} reserva(s) cancelada(s) com sucesso.")
        if erros:
            self.message_user(
                request,
                f"{erros} reserva(s) não puderam ser canceladas (status inválido).",
                level="WARNING",
            )
