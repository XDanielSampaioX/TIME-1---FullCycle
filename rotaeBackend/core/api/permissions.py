from rest_framework.permissions import AllowAny


class RotaPublica:
    """Rota aberta: sem autenticação, um token velho no cabeçalho (frontend ou "Authorize"
    do Swagger) não bloqueia a requisição, e o Swagger deixa de mostrar o cadeado."""

    authentication_classes = ()
    permission_classes = (AllowAny,)
