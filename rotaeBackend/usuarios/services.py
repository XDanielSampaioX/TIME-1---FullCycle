from django.db import IntegrityError, transaction
from rest_framework import serializers
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Usuario


def revogar_refresh_tokens(usuario):
    for token in OutstandingToken.objects.filter(user=usuario):
        BlacklistedToken.objects.get_or_create(token=token)


@transaction.atomic
def desativar_usuario(usuario):
    """Desativa a conta sem apagar o histórico e revoga os refresh tokens emitidos."""
    usuario.is_active = False
    usuario.save(update_fields=["is_active", "atualizado_em"])
    revogar_refresh_tokens(usuario)


@transaction.atomic
def alterar_senha(usuario, nova_senha):
    """Troca a senha, derruba todas as sessões e devolve tokens novos para a sessão atual.

    Os access tokens antigos caem pelo CHECK_REVOKE_TOKEN (carregam o hash da senha antiga);
    os refresh tokens antigos caem pela blacklist.
    """
    usuario.set_password(nova_senha)
    usuario.save(update_fields=["password", "atualizado_em"])
    revogar_refresh_tokens(usuario)

    refresh = RefreshToken.for_user(usuario)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


def salvar_respeitando_unicidade(salvar, dados, instancia=None):
    """Converte o IntegrityError de uma corrida em e-mail/CPF duplicado no mesmo 400 da validação."""
    try:
        with transaction.atomic():
            return salvar()
    except IntegrityError as erro:
        outros = Usuario.objects.exclude(pk=getattr(instancia, "pk", None))
        erros = {}
        for campo in ("email", "cpf"):
            valor = dados.get(campo)
            if valor and outros.filter(**{campo: valor}).exists():
                erros[campo] = [Usuario._meta.get_field(campo).error_messages["unique"]]
        if not erros:
            raise
        raise serializers.ValidationError(erros) from erro
