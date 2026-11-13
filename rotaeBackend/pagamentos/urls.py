from django.urls import path

from .views import PagamentoCriarView

urlpatterns = [
    # <pk> e não <reserva_id>: o camelCase do Swagger renomearia o parâmetro
    # para reservaId e o "Try it out" não substituiria o placeholder da URL.
    path(
        "reservas/<int:pk>/pagamentos/",
        PagamentoCriarView.as_view(),
        name="criar_pagamento",
    ),
]
