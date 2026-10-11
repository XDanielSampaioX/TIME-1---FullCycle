from django.urls import path

from .views import ReservaCriarView

urlpatterns = [
    path("reservas/", ReservaCriarView.as_view(), name="criar_reserva"),
]