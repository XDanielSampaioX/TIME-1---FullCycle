from rest_framework.generics import ListAPIView

from .models import Cidade
from .serializers import CidadeSerializer
from .swagger import cidades_list_schema


@cidades_list_schema
class CidadeListView(ListAPIView):
    queryset = Cidade.objects.all()
    serializer_class = CidadeSerializer

