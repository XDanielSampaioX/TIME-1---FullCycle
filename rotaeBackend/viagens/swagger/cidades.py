from drf_spectacular.utils import extend_schema

from viagens.serializers import CidadeSerializer

cidades_list_schema = extend_schema(
    summary="Listar cidades",
    description="Retorna a lista de todas as cidades disponíveis para viagens.",
    tags=["cidades"],
    responses={
        200: CidadeSerializer(many=True),
    },
)
