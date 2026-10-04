from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny

from .filters import ViagemFilter
from .models import Cidade, Viagem, ViagemAssento
from .serializers import CidadeSerializer, ViagemAssentoSerializer, ViagemSerializer
from .swagger import (
    cidades_list_schema,
    viagem_assentos_list_schema,
    viagens_detail_schema,
    viagens_list_schema,
)


class RotaPublica:
    """Consulta aberta: sem autenticação, um token velho no cabeçalho (frontend ou "Authorize"
    do Swagger) não bloqueia a busca, e o Swagger deixa de mostrar o cadeado."""

    authentication_classes = ()
    permission_classes = (AllowAny,)


@cidades_list_schema
class CidadeListView(RotaPublica, ListAPIView):
    queryset = Cidade.objects.all()
    serializer_class = CidadeSerializer


@viagens_list_schema
class ViagemListView(RotaPublica, ListAPIView):
    serializer_class = ViagemSerializer
    filter_backends = (DjangoFilterBackend,)
    filterset_class = ViagemFilter

    def get_queryset(self):
        return (
            Viagem.objects.disponiveis_para_venda()
            .com_assentos_livres()
            .select_related("origem", "destino", "onibus")
            .order_by("partida_em", "id")
        )


@viagens_detail_schema
class ViagemDetailView(RotaPublica, RetrieveAPIView):
    serializer_class = ViagemSerializer
    queryset = Viagem.objects.com_assentos_livres().select_related("origem", "destino", "onibus")


@viagem_assentos_list_schema
class ViagemAssentoListView(RotaPublica, ListAPIView):
    serializer_class = ViagemAssentoSerializer
    pagination_class = None

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return ViagemAssento.objects.none()

        viagem = get_object_or_404(Viagem, pk=self.kwargs["pk"])
        return viagem.viagem_assentos.select_related("assento").order_by("assento__numero")
