from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenBlacklistSerializer

from usuarios.serializers import LoginSerializer, UsuarioSerializer


class TokensSerializer(serializers.Serializer):
    """Só documenta pares de tokens no Swagger."""

    access = serializers.CharField()
    refresh = serializers.CharField()


class LoginRespostaSerializer(TokensSerializer):
    """Só documenta a resposta do login no Swagger."""

    user = UsuarioSerializer()

login_schema = extend_schema(
    summary="Login",
    description="Autentica por e-mail e senha e devolve os tokens JWT e os dados do usuário.",
    tags=["auth"],
    request=LoginSerializer,
    responses={
        200: LoginRespostaSerializer,
        400: OpenApiResponse(description="E-mail ou senha não enviados."),
        401: OpenApiResponse(description="E-mail ou senha inválidos, ou conta desativada."),
    },
)

refresh_schema = extend_schema(
    summary="Renovar token",
    description="Troca um refresh token válido por um novo access token e um novo refresh token.",
    tags=["auth"],
)

logout_schema = extend_schema(
    summary="Logout",
    description=(
        "Revoga o refresh token enviado, encerrando a sessão. O access token continua válido até "
        "expirar, então o frontend deve descartar os dois tokens."
    ),
    tags=["auth"],
    request=TokenBlacklistSerializer,
    responses={
        204: OpenApiResponse(description="Sessão encerrada."),
        400: OpenApiResponse(description="Refresh token não enviado."),
        401: OpenApiResponse(description="Refresh token inválido, expirado ou já revogado."),
    },
)
