from django.urls import path

from .views import CidadeListView, ViagemAssentoListView, ViagemDetailView, ViagemListView

urlpatterns = [
    path("cidades/", CidadeListView.as_view(), name="lista_cidades"),
    path("viagens/", ViagemListView.as_view(), name="lista_viagens"),
    path("viagens/<int:pk>/", ViagemDetailView.as_view(), name="detalhe_viagem"),
    path("viagens/<int:pk>/assentos/", ViagemAssentoListView.as_view(), name="assentos_viagem"),
]
