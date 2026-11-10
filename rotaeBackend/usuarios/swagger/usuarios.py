from drf_spectacular.utils import extend_schema, extend_schema_view

from core.api.swagger import NAO_AUTENTICADO, resposta_validacao
from usuarios.serializers import (
    AlteracaoSenhaSerializer,
    AtualizacaoUsuarioSerializer,
    CadastroUsuarioSerializer,
    UsuarioSerializer,
)

from .auth import TokensSerializer

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
        400: resposta_validacao(
            "Erros de validação por campo (inclui e-mail ou CPF já cadastrados).",
            {
                "Campos inválidos": {
                    "email": ["Já existe um usuário com este e-mail."],
                    "cpf": ["CPF inválido."],
                    "dataNasc": ["Este campo é obrigatório."],
                }
            },
        ),
    },
)

me_schema = extend_schema_view(
    get=extend_schema(
        summary="Dados do usuário autenticado",
        tags=["usuarios"],
        responses={
            200: UsuarioSerializer,
            401: NAO_AUTENTICADO,
        },
    ),
    patch=extend_schema(
        summary="Atualizar dados do usuário autenticado",
        description="Atualiza nome, e-mail, celular e data de nascimento. CPF e senha não mudam por aqui.",
        tags=["usuarios"],
        request=AtualizacaoUsuarioSerializer,
        responses={
            200: UsuarioSerializer,
            400: resposta_validacao(
                "Erros de validação por campo.",
                {
                    "E-mail já usado": {
                        "email": ["Já existe um usuário com este e-mail."]
                    }
                },
            ),
            401: NAO_AUTENTICADO,
        },
    ),
    delete=extend_schema(
        summary="Desativar conta",
        description="Marca a conta como inativa e revoga os refresh tokens. O histórico de reservas é mantido.",
        tags=["usuarios"],
        responses={204: None, 401: NAO_AUTENTICADO},
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
        400: resposta_validacao(
            "Senha atual incorreta, confirmação diferente ou senha fraca.",
            {
                "Senha atual incorreta": {"senhaAtual": ["Senha atual incorreta."]},
                "Confirmação diferente": {
                    "confirmacaoNovaSenha": [
                        "A confirmação não confere com a nova senha."
                    ]
                },
            },
        ),
        401: NAO_AUTENTICADO,
    },
)
