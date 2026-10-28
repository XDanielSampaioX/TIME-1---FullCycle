from django.contrib import admin

from viagens.models import ViagemAssento
from .exceptions import ReservaInvalidaError
from .models import Passageiro, Reserva
from .services import cancelar_reserva


class ViagemAssentoInline(admin.TabularInline):
    model = ViagemAssento
    extra = 0
    fields = ("assento", "status")
    can_delete = False

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("assento__onibus")

    def has_add_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False


class PassageiroInline(admin.TabularInline):
    model = Passageiro
    extra = 0
    fields = ("nome", "cpf", "data_nasc", "email", "celular", "usuario")
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(Passageiro)
class PassageiroAdmin(admin.ModelAdmin):
    list_display = ("id", "nome", "cpf", "email", "reserva", "usuario", "criado_em")
    list_filter = ("reserva__status", "criado_em")
    search_fields = ("nome", "cpf", "email", "reserva__id", "usuario__email")
    list_select_related = ("reserva__usuario", "reserva__viagem__origem", "reserva__viagem__destino", "usuario")
    raw_id_fields = ("reserva", "usuario")

    # Passageiros só nascem pelo cadastro na reserva; o admin serve para busca e auditoria.
    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
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
    list_select_related = ("usuario", "viagem__origem", "viagem__destino")
    inlines = (ViagemAssentoInline, PassageiroInline)
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
            self.message_user(
                request, f"{canceladas} reserva(s) cancelada(s) com sucesso."
            )
        if erros:
            self.message_user(
                request,
                f"{erros} reserva(s) não puderam ser canceladas (status inválido).",
                level="WARNING",
            )
