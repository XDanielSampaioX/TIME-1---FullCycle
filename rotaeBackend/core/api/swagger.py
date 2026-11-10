"""
Respostas de erro reutilizáveis na documentação OpenAPI (Swagger).

Os corpos seguem o que a API devolve de verdade:
- erros simples (401, 404, 409...): {"detail": "mensagem"}
- erros de validação (400): {"campo": ["mensagem", ...]}
"""

from drf_spectacular.utils import OpenApiExample, OpenApiResponse
from rest_framework import serializers


class ErroSerializer(serializers.Serializer):
    """Só documenta o corpo dos erros simples no Swagger."""

    detail = serializers.CharField()
    code = serializers.CharField(
        required=False, help_text="Presente apenas em erros de token JWT."
    )


ERRO_VALIDACAO_SCHEMA = {
    "type": "object",
    "description": "Mensagens de erro agrupadas por campo (em camelCase).",
    "additionalProperties": {"type": "array", "items": {"type": "string"}},
}


def _exemplos(exemplos):
    return [OpenApiExample(nome, value=valor) for nome, valor in exemplos.items()]


def resposta_erro(descricao, *mensagens):
    """Erro no formato {"detail": "..."}; cada mensagem vira um exemplo."""
    mensagens = mensagens or (descricao,)
    return OpenApiResponse(
        response=ErroSerializer,
        description=descricao,
        examples=_exemplos({m: {"detail": m} for m in mensagens}),
    )


def resposta_validacao(descricao, exemplos, schema=ERRO_VALIDACAO_SCHEMA):
    """Erro de validação; `exemplos` mapeia nome do exemplo -> corpo da resposta."""
    return OpenApiResponse(
        response=schema, description=descricao, examples=_exemplos(exemplos)
    )


NAO_AUTENTICADO = resposta_erro(
    "Não autenticado: token ausente, inválido ou expirado.",
    "As credenciais de autenticação não foram fornecidas.",
    "O token informado não é válido para qualquer tipo de token",
)

PAGINA_INVALIDA = resposta_erro("Página inexistente.", "Página inválida.")
