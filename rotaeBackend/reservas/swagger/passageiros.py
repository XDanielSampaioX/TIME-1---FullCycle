from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema

from core.api.swagger import NAO_AUTENTICADO, resposta_erro
from reservas.serializers import PassageiroCriarSerializer, PassageiroSerializer

passageiros_cadastrar_schema = extend_schema(
    request=PassageiroCriarSerializer(many=True),
    responses={
        201: PassageiroSerializer(many=True),
        400: OpenApiResponse(
            response={"type": "object"},
            description=(
                "Dados inválidos (CPF, celular ou data de nascimento), CPFs duplicados no payload "
                "ou quantidade de passageiros diferente da quantidade de assentos da reserva. "
                "Erros de um passageiro vêm na chave com a posição dele na lista."
            ),
            examples=[
                OpenApiExample(
                    "Campo inválido no 1º passageiro",
                    value={"0": {"cpf": ["CPF inválido."]}},
                ),
                OpenApiExample(
                    "CPFs duplicados",
                    value={"nonFieldErrors": ["A lista contém CPFs duplicados."]},
                ),
                OpenApiExample(
                    "Quantidade diferente dos assentos",
                    value={
                        "detail": "Informe exatamente 2 passageiro(s), um para cada "
                        "assento da reserva."
                    },
                ),
            ],
        ),
        401: NAO_AUTENTICADO,
        404: resposta_erro(
            "Reserva não encontrada ou pertencente a outro usuário.",
            "Reserva não encontrada.",
        ),
        409: resposta_erro(
            "Reserva já possui passageiros cadastrados, não está pendente de pagamento ou expirou.",
            "Reserva já possui passageiros cadastrados.",
            "Reserva não aceita passageiros (status: PAGO).",
            "Reserva expirada.",
        ),
    },
    examples=[
        OpenApiExample(
            "Dois passageiros",
            value=[
                {
                    "nome": "João da Silva",
                    "email": "joao@email.com",
                    "celular": "85999990000",
                    "dataNasc": "1995-04-20",
                    "cpf": "52998224725",
                },
                {
                    "nome": "Maria de Sousa",
                    "email": "maria@email.com",
                    "celular": "85988880000",
                    "dataNasc": "1996-05-15",
                    "cpf": "11144477735",
                },
            ],
            request_only=True,
        ),
    ],
    summary="Cadastrar passageiros da reserva",
    description=(
        "Cadastra os passageiros de uma reserva do usuário autenticado, um para cada assento reservado. "
        "Todos os dados do bilhete são obrigatórios, inclusive quando o passageiro é o próprio usuário; "
        "apenas o passageiro com o CPF do usuário autenticado é vinculado à conta dele."
    ),
    tags=["passageiros"],
)
