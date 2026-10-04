from drf_spectacular.utils import OpenApiResponse, extend_schema

from usuarios.serializers import LoginRespostaSerializer, LoginSerializer

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
