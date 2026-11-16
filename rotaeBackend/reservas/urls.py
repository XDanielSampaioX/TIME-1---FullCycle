from django.urls import path

from .views import (
    PassageirosCadastrarView,
    PassagemDetalheView,
    PassagemMinhasPassagensView,
    ReservaCancelarView,
    ReservaCriarView,
    ReservaDetalheView,
    ReservaMinhasReservasView,
)

urlpatterns = [
    path("reservas/", ReservaCriarView.as_view(), name="criar_reserva"),
    path("reservas/<int:pk>/", ReservaDetalheView.as_view(), name="detalhe_reserva"),
    path(
        "reservas/<int:pk>/cancelar/",
        ReservaCancelarView.as_view(),
        name="cancelar_reserva",
    ),
    path(
        "reservas/<int:pk>/passageiros/",
        PassageirosCadastrarView.as_view(),
        name="cadastrar_passageiros",
    ),
    path("me/reservas/", ReservaMinhasReservasView.as_view(), name="minhas_reservas"),
    path(
        "me/passagens/",
        PassagemMinhasPassagensView.as_view(),
        name="minhas_passagens",
    ),
    path("passagens/<int:pk>/", PassagemDetalheView.as_view(), name="detalhe_passagem"),
]
