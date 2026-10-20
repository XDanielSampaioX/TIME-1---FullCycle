from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Reserva
from .serializers import ReservaCriarSerializer, ReservaSerializer
from .services import (
    AssentoIndisponivelError,
    ReservaInvalidaError,
    ReservaNaoEncontradaError,
    ViagemNaoEncontradaError,
    cancelar_reserva,
    criar_reserva,
)


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
            "Os assentos são bloqueados via select_for_update() no banco de dados. "
            "Se qualquer assento não estiver disponível, retorna 409."
        ),
    )
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
                {"detail": str(e) or "Um ou mais assentos já estão reservados."},
                status=status.HTTP_409_CONFLICT,
            )
        except ViagemNaoEncontradaError as e:
            return Response(
                {"detail": str(e) or "Viagem não encontrada."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        output = ReservaSerializer(reserva, context={"request": request})
        return Response(output.data, status=status.HTTP_201_CREATED)


class ReservaDetalheView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={
            200: ReservaSerializer,
            401: None,
            404: None,
        },
        summary="Obter detalhes de uma reserva",
        description="Retorna os detalhes completos de uma reserva pertencente ao usuário autenticado.",
    )
    def get(self, request, pk):
        try:
            reserva = (
                Reserva.objects
                .select_related("viagem")
                .prefetch_related("viagem_assentos__assento")
                .get(pk=pk, usuario=request.user)
            )
        except Reserva.DoesNotExist:
            return Response(
                {"detail": "Reserva não encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )

        output = ReservaSerializer(reserva, context={"request": request})
        return Response(output.data)


class ReservaCancelarView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={
            200: ReservaSerializer,
            400: None,
            401: None,
            404: None,
        },
        summary="Cancelar reserva",
        description=(
            "Cancela uma reserva com status PAGAMENTO_PENDENTE do usuário autenticado "
            "e libera os assentos associados de volta para DISPONIVEL."
        ),
    )
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


class ReservaMinhasReservasView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={
            200: ReservaSerializer(many=True),
            401: None,
        },
        summary="Listar reservas do usuário autenticado",
        description="Retorna todas as reservas realizadas pelo usuário autenticado, ordenadas pela mais recente.",
    )
    def get(self, request):
        reservas = (
            Reserva.objects
            .filter(usuario=request.user)
            .select_related("viagem")
            .prefetch_related("viagem_assentos__assento")
            .order_by("-criado_em")
        )
        output = ReservaSerializer(reservas, many=True, context={"request": request})
        return Response(output.data)
