from rest_framework import status
from rest_framework.generics import CreateAPIView, GenericAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenRefreshView

from core.api.permissions import RotaPublica

from .serializers import (
    AlteracaoSenhaSerializer,
    AtualizacaoUsuarioSerializer,
    CadastroUsuarioSerializer,
    LoginSerializer,
    UsuarioSerializer,
)
from .services import alterar_senha, desativar_usuario
from .swagger import (
    alterar_senha_schema,
    cadastro_usuario_schema,
    login_schema,
    me_schema,
    refresh_schema,
)


@cadastro_usuario_schema
class CadastroUsuarioView(RotaPublica, CreateAPIView):
    serializer_class = CadastroUsuarioSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario = serializer.save()
        return Response(UsuarioSerializer(usuario).data, status=status.HTTP_201_CREATED)


@login_schema
class LoginView(RotaPublica, GenericAPIView):
    serializer_class = LoginSerializer

    def get_authenticate_header(self, request):
        # Sem autenticadores o DRF trocaria o 401 de credenciais inválidas por 403.
        return 'Bearer realm="api"'

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)


@refresh_schema
class RefreshView(TokenRefreshView):
    pass


@me_schema
class MeView(RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAuthenticated,)
    http_method_names = ("get", "patch", "delete", "head", "options")

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method == "PATCH":
            return AtualizacaoUsuarioSerializer
        return UsuarioSerializer

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object(), data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        usuario = serializer.save()
        return Response(UsuarioSerializer(usuario).data)

    def perform_destroy(self, instance):
        desativar_usuario(instance)


@alterar_senha_schema
class AlterarSenhaView(GenericAPIView):
    serializer_class = AlteracaoSenhaSerializer
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tokens = alterar_senha(request.user, serializer.validated_data["nova_senha"])
        return Response(tokens)
