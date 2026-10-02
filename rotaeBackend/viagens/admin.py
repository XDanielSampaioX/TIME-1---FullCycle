from django.contrib import admin

from .models import Assento, Cidade, Onibus, Viagem, ViagemAssento
from .services import criar_assentos_do_onibus, gerar_assentos_da_viagem


@admin.register(Cidade)
class CidadeAdmin(admin.ModelAdmin):
    list_display = ("nome", "uf", "criado_em", "atualizado_em")
    search_fields = ("nome", "uf")
    list_filter = ("criado_em", "atualizado_em")


class AssentoInline(admin.TabularInline):
    model = Assento
    extra = 0


@admin.register(Onibus)
class OnibusAdmin(admin.ModelAdmin):
    list_display = ("identificacao", "modelo", "total_assentos", "criado_em")
    search_fields = ("identificacao", "modelo")
    inlines = (AssentoInline,)

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        criar_assentos_do_onibus(form.instance)


class ViagemAssentoInline(admin.TabularInline):
    model = ViagemAssento
    extra = 0
    fields = ("assento", "status")
    readonly_fields = ("assento", "status")
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Viagem)
class ViagemAdmin(admin.ModelAdmin):
    list_display = ("__str__", "classe", "preco_centavos", "duracao", "status")
    list_filter = ("status", "classe", "partida_em")
    search_fields = ("origem__nome", "destino__nome", "onibus__identificacao")
    list_select_related = ("origem", "destino")
    autocomplete_fields = ("onibus", "origem", "destino")
    readonly_fields = ("duracao",)
    date_hierarchy = "partida_em"
    inlines = (ViagemAssentoInline,)
    actions = ("gerar_assentos",)

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        gerar_assentos_da_viagem(form.instance)

    @admin.action(description="Gerar assentos das viagens selecionadas")
    def gerar_assentos(self, request, queryset):
        for viagem in queryset.select_related("onibus"):
            gerar_assentos_da_viagem(viagem)
        self.message_user(request, f"Assentos gerados para {queryset.count()} viagem(ns).")


@admin.register(ViagemAssento)
class ViagemAssentoAdmin(admin.ModelAdmin):
    list_display = ("viagem", "assento", "status")
    list_filter = ("status",)
    search_fields = ("viagem__origem__nome", "viagem__destino__nome")
    list_select_related = ("viagem__origem", "viagem__destino", "assento__onibus")
    readonly_fields = ("viagem", "assento")
