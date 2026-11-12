from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from reservas.exceptions import ReservaNaoEncontradaError

from .exceptions import GatewayIndisponivelError, PagamentoNaoPermitidoError
from .serializers import PagamentoCriarSerializer, PagamentoSerializer
from .services import processar_pagamento
from .swagger import pagamento_criar_schema


@pagamento_criar_schema
class PagamentoCriarView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        serializer = PagamentoCriarSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            pagamento = processar_pagamento(
                reserva_id=pk,
                usuario=request.user,
                metodo_pagamento=serializer.validated_data["metodo_pagamento"],
            )
        except ReservaNaoEncontradaError:
            return Response(
                {"detail": "Reserva não encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except PagamentoNaoPermitidoError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_409_CONFLICT,
            )
        except GatewayIndisponivelError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        output = PagamentoSerializer(pagamento)
        return Response(output.data, status=status.HTTP_201_CREATED)
