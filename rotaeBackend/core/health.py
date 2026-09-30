from django.db import connections
from django.db.utils import Error as DatabaseError
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


@extend_schema(
    summary="Healthcheck da aplicação",
    description="Verifica a saúde da aplicação e a conexão com o banco de dados.",
    tags=["health"],
    responses={
        200: OpenApiResponse(description="Aplicação saudável e banco de dados conectado."),
        503: OpenApiResponse(description="Falha na conexão com o banco de dados."),
    },
)
class HealthView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        try:
            with connections["default"].cursor() as cursor:
                cursor.execute("SELECT 1")

            return Response(
                {"status": "ok", "database": "up"},
                status=status.HTTP_200_OK,
            )
        except DatabaseError as e:
            return Response(
                {"status": "error", "database": "down", "error": str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
