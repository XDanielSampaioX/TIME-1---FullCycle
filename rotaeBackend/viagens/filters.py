import django_filters
from django.db.models import Q

from .models import Viagem

PERIODOS = {
    0: ("Madrugada (00:00 - 06:00)", 0, 6),
    1: ("Manhã (06:00 - 12:00)", 6, 12),
    2: ("Tarde (12:00 - 18:00)", 12, 18),
    3: ("Noite (18:00 - 00:00)", 18, 24),
}


class ViagemFilter(django_filters.FilterSet):
    origem = django_filters.NumberFilter(field_name="origem_id", label="ID da cidade de origem.")
    destino = django_filters.NumberFilter(field_name="destino_id", label="ID da cidade de destino.")
    data = django_filters.DateFilter(
        field_name="partida_em", lookup_expr="date", label="Data de partida (AAAA-MM-DD)."
    )
    classe = django_filters.MultipleChoiceFilter(
        choices=Viagem.Classe.choices, label="Classe do ônibus. Aceita vários valores."
    )
    preco_min = django_filters.NumberFilter(
        field_name="preco_centavos", lookup_expr="gte", label="Preço mínimo em centavos."
    )
    preco_max = django_filters.NumberFilter(
        field_name="preco_centavos", lookup_expr="lte", label="Preço máximo em centavos."
    )
    periodo = django_filters.MultipleChoiceFilter(
        choices=[(valor, titulo) for valor, (titulo, _, _) in PERIODOS.items()],
        method="filtrar_periodo",
        label="Período do horário de partida (0 a 3). Aceita vários valores.",
    )
    passageiros = django_filters.NumberFilter(
        field_name="assentos_livres",
        lookup_expr="gte",
        label="Quantidade de passageiros: retorna viagens com assentos livres suficientes.",
    )
    ordering = django_filters.OrderingFilter(
        fields=(
            ("preco_centavos", "preco"),
            ("partida_em", "partida"),
            ("duracao", "duracao"),
        ),
        label="Ordenação: preco, partida ou duracao. Use o prefixo '-' para ordem decrescente.",
    )

    class Meta:
        model = Viagem
        fields = ()

    def filtrar_periodo(self, queryset, name, value):
        condicao = Q()
        for periodo in value:
            _, inicio, fim = PERIODOS[int(periodo)]
            condicao |= Q(partida_em__hour__gte=inicio, partida_em__hour__lt=fim)
        return queryset.filter(condicao)
