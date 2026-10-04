from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view

from usuarios.serializers import (
    AlteracaoSenhaSerializer,
    AtualizacaoUsuarioSerializer,
    CadastroUsuarioSerializer,
    TokensSerializer,
    UsuarioSerializer,
)

cadastro_usuario_schema = extend_schema(
    summary="Cadastrar usuário",
    description=(
        "Cria a conta do usuário. CPF e celular aceitam máscara e são gravados só com dígitos; "
        "o e-mail é gravado em minúsculas. A senha passa pelos validadores do Django."
    ),
    tags=["usuarios"],
    request=CadastroUsuarioSerializer,
    responses={
        201: UsuarioSerializer,
        400: OpenApiResponse(description="Erros de validação por campo."),
    },
)

me_schema = extend_schema_view(
    get=extend_schema(
        summary="Dados do usuário autenticado",
        tags=["usuarios"],
        responses={200: UsuarioSerializer, 401: OpenApiResponse(description="Não autenticado.")},
    ),
    patch=extend_schema(
        summary="Atualizar dados do usuário autenticado",
        description="Atualiza nome, e-mail, celular e data de nascimento. CPF e senha não mudam por aqui.",
        tags=["usuarios"],
        request=AtualizacaoUsuarioSerializer,
        responses={
            200: UsuarioSerializer,
            400: OpenApiResponse(description="Erros de validação por campo."),
            401: OpenApiResponse(description="Não autenticado."),
        },
    ),
    delete=extend_schema(
        summary="Desativar conta",
        description="Marca a conta como inativa e revoga os refresh tokens. O histórico de reservas é mantido.",
        tags=["usuarios"],
        responses={204: None, 401: OpenApiResponse(description="Não autenticado.")},
    ),
)

alterar_senha_schema = extend_schema(
    summary="Alterar senha",
    description=(
        "Troca a senha do usuário autenticado após conferir a senha atual. Todas as sessões "
        "abertas são derrubadas (access e refresh antigos passam a devolver 401); a resposta "
        "traz um par de tokens novo para a sessão atual continuar logada."
    ),
    tags=["usuarios"],
    request=AlteracaoSenhaSerializer,
    responses={
        200: TokensSerializer,
        400: OpenApiResponse(description="Senha atual incorreta, confirmação diferente ou senha fraca."),
        401: OpenApiResponse(description="Não autenticado."),
    },
)
