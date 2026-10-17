from django.contrib import admin

from .models import Reserva, ReservaAssento


class ReservaAssentoInline(admin.TabularInline):
    model = ReservaAssento
    extra = 0
    fields = ("assento", "preco_centavos")
    readonly_fields = ("assento", "preco_centavos")
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
    list_display = ("id", "usuario", "viagem", "status", "created_at", "updated_at")
    list_filter = ("status", "created_at")
    search_fields = ("usuario__email", "usuario__nome", "viagem__origem__nome", "viagem__destino__nome")
    readonly_fields = ("created_at", "updated_at")
    inlines = (ReservaAssentoInline,)


@admin.register(ReservaAssento)
class ReservaAssentoAdmin(admin.ModelAdmin):
    list_display = ("id", "reserva", "assento", "preco_centavos")
    search_fields = ("reserva__id", "assento__numero")
