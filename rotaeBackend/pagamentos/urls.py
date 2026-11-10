from django.urls import path

from .views import PagamentoCriarView

urlpatterns = [
    path(
        "reservas/<int:reserva_id>/pagamentos/",
        PagamentoCriarView.as_view(),
        name="criar_pagamento",
    ),
]
