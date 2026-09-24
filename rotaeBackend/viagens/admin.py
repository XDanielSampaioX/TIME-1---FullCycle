from django.contrib import admin

from .models import Cidade


@admin.register(Cidade)
class CidadeAdmin(admin.ModelAdmin):
    list_display = ("nome", "uf", "criado_em", "atualizado_em")
    search_fields = ("nome", "uf")
    list_filter = ("criado_em", "atualizado_em")