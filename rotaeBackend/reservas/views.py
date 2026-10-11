from django.db import DatabaseError
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import ReservaCriarSerializer, ReservaSerializer
from .services import AssentoIndisponivelError, ViagemNaoEncontradaError


class ReservaCriarView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=ReservaCriarSerializer,
        responses={
            201: ReservaSerializer,
            400: None,
            401: None,
            409: None,
        },
        summary="Criar reserva com bloqueio temporário",
        description=(
            "Cria uma reserva para a viagem e assentos informados. "
            "Usa bloqueio pessimista (select_for_update nowait) para "
            "proteção contra concorrência. Se houver conflito, retorna 409."
        ),
    )
    def post(self, request):
        serializer = ReservaCriarSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)

        try:
            reserva = serializer.save()
        except AssentoIndisponivelError:
            return Response(
                {"detail": "Um ou mais assentos já estão reservados."},
                status=status.HTTP_409_CONFLICT,
            )
        except ViagemNaoEncontradaError:
            return Response(
                {"detail": "Viagem não encontrada."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except DatabaseError:
            return Response(
                {"detail": "Conflito de concorrência. Tente novamente."},
                status=status.HTTP_409_CONFLICT,
            )

        output = ReservaSerializer(reserva, context={"request": request})
        return Response(output.data, status=status.HTTP_201_CREATED)
