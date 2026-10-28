from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .exceptions import (
    AssentoIndisponivelError,
    AssentoOutraViagemError,
    QuantidadePassageirosError,
    ReservaInvalidaError,
    ReservaNaoEncontradaError,
    ViagemNaoEncontradaError,
)
from .models import Reserva
from .serializers import (
    PassageiroCriarSerializer,
    PassageiroSerializer,
    ReservaCriarSerializer,
    ReservaSerializer,
)
from .services import cadastrar_passageiros, cancelar_reserva, criar_reserva
from .swagger import (
    passageiros_cadastrar_schema,
    reserva_cancelar_schema,
    reserva_criar_schema,
    reserva_detalhe_schema,
    reserva_minhas_reservas_schema,
)


@reserva_criar_schema
class ReservaCriarView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ReservaCriarSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            reserva = criar_reserva(
                usuario=request.user,
                viagem_id=serializer.validated_data["viagem_id"],
                viagem_assento_ids=serializer.validated_data["viagem_assento_ids"],
            )
        except AssentoIndisponivelError as e:
            return Response(
                {
                    "detail": str(e),
                    "assentos": e.assentos_indisponiveis,
                },
                status=status.HTTP_409_CONFLICT,
            )
        except AssentoOutraViagemError as e:
            return Response(
                {
                    "detail": str(e),
                    "assentos": e.assentos_indisponiveis,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        except ViagemNaoEncontradaError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        output = ReservaSerializer(reserva, context={"request": request})
        return Response(output.data, status=status.HTTP_201_CREATED)


@reserva_detalhe_schema
class ReservaDetalheView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ReservaSerializer

    def get_queryset(self):
        return (
            Reserva.objects
            .filter(usuario=self.request.user)
            .select_related("viagem__origem", "viagem__destino", "viagem__onibus")
            .prefetch_related("viagem_assentos__assento", "passageiros")
        )


@reserva_cancelar_schema
class ReservaCancelarView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            reserva = cancelar_reserva(reserva_id=pk, usuario=request.user)
        except ReservaNaoEncontradaError:
            return Response(
                {"detail": "Reserva não encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except ReservaInvalidaError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        output = ReservaSerializer(reserva, context={"request": request})
        return Response(output.data)


@passageiros_cadastrar_schema
class PassageirosCadastrarView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        serializer = PassageiroCriarSerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)

        try:
            passageiros = cadastrar_passageiros(
                reserva_id=pk,
                usuario=request.user,
                passageiros=serializer.validated_data,
            )
        except ReservaNaoEncontradaError:
            return Response(
                {"detail": "Reserva não encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except ReservaInvalidaError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_409_CONFLICT,
            )
        except QuantidadePassageirosError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        output = PassageiroSerializer(passageiros, many=True)
        return Response(output.data, status=status.HTTP_201_CREATED)


@reserva_minhas_reservas_schema
class ReservaMinhasReservasView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ReservaSerializer

    def get_queryset(self):
        return (
            Reserva.objects
            .filter(usuario=self.request.user)
            .select_related("viagem__origem", "viagem__destino", "viagem__onibus")
            .prefetch_related("viagem_assentos__assento", "passageiros")
            .order_by("-criado_em")
        )
