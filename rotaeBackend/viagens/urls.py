from django.urls import path

from .views import CidadeListView

urlpatterns = [
    path("cidades/", CidadeListView.as_view(), name="lista_cidades"),
]
