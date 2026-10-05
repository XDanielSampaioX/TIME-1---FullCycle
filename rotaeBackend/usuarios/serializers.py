from collections.abc import Mapping

from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError, transaction
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Usuario
from .validators import so_digitos

CAMPOS_PUBLICOS = ("id", "nome", "email", "celular", "data_nasc", "cpf", "criado_em", "atualizado_em")


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


def validar_senha(senha, usuario):
    try:
        validate_password(senha, usuario)
    except DjangoValidationError as erro:
        raise serializers.ValidationError(list(erro.messages)) from erro


class UsuarioSerializer(serializers.ModelSerializer):

    class Meta:
        model = Usuario
        fields = CAMPOS_PUBLICOS
        read_only_fields = CAMPOS_PUBLICOS


class NormalizaDadosMixin:
    """Normaliza e-mail, CPF e celular antes das validações de formato e unicidade."""

    def to_internal_value(self, data):
        if not isinstance(data, Mapping):
            # Deixa o DRF responder 400 ("Invalid data") para listas, textos etc.
            return super().to_internal_value(data)
        data = data.copy()
        if isinstance(data.get("email"), str):
            data["email"] = data["email"].strip().lower()
        for campo in ("cpf", "celular"):
            if isinstance(data.get(campo), str):
                data[campo] = so_digitos(data[campo])
        return super().to_internal_value(data)


class CadastroUsuarioSerializer(NormalizaDadosMixin, serializers.ModelSerializer):
    senha = serializers.CharField(write_only=True, trim_whitespace=False, style={"input_type": "password"})

    class Meta:
        model = Usuario
        fields = ("nome", "email", "senha", "celular", "data_nasc", "cpf")
        extra_kwargs = {
            "celular": {"required": True, "allow_blank": False},
            "data_nasc": {"required": True, "allow_null": False},
            "cpf": {"required": True, "allow_null": False, "allow_blank": False},
        }

    def validate(self, attrs):
        dados = {campo: valor for campo, valor in attrs.items() if campo != "senha"}
        try:
            validar_senha(attrs["senha"], Usuario(**dados))
        except serializers.ValidationError as erro:
            raise serializers.ValidationError({"senha": erro.detail}) from erro
        return attrs

    def create(self, validated_data):
        senha = validated_data.pop("senha")
        return salvar_respeitando_unicidade(
            lambda: Usuario.objects.create_user(password=senha, **validated_data),
            validated_data,
        )


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(write_only=True)
    senha = serializers.CharField(write_only=True, trim_whitespace=False, style={"input_type": "password"})

    def validate(self, attrs):
        usuario = authenticate(
            self.context.get("request"),
            email=attrs["email"].strip().lower(),
            password=attrs["senha"],
        )
        # authenticate() também devolve None para conta desativada (is_active=False).
        if usuario is None:
            raise AuthenticationFailed("E-mail ou senha inválidos.", code="credenciais_invalidas")

        refresh = RefreshToken.for_user(usuario)
        update_last_login(None, usuario)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UsuarioSerializer(usuario).data,
        }


class AtualizacaoUsuarioSerializer(NormalizaDadosMixin, serializers.ModelSerializer):
    """PATCH /me/: só dados cadastrais. CPF, senha e permissões ficam de fora."""

    class Meta:
        model = Usuario
        fields = ("nome", "email", "celular", "data_nasc")
        extra_kwargs = {
            "celular": {"allow_blank": False},
            "data_nasc": {"allow_null": False},
        }

    def update(self, instance, validated_data):
        return salvar_respeitando_unicidade(
            lambda: super(AtualizacaoUsuarioSerializer, self).update(instance, validated_data),
            validated_data,
            instancia=instance,
        )


class AlteracaoSenhaSerializer(serializers.Serializer):
    senha_atual = serializers.CharField(write_only=True, trim_whitespace=False)
    nova_senha = serializers.CharField(write_only=True, trim_whitespace=False)
    confirmacao_nova_senha = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_senha_atual(self, valor):
        if not self.context["request"].user.check_password(valor):
            raise serializers.ValidationError("Senha atual incorreta.")
        return valor

    def validate(self, attrs):
        if attrs["nova_senha"] != attrs["confirmacao_nova_senha"]:
            raise serializers.ValidationError(
                {"confirmacao_nova_senha": "A confirmação não confere com a nova senha."}
            )
        try:
            validar_senha(attrs["nova_senha"], self.context["request"].user)
        except serializers.ValidationError as erro:
            raise serializers.ValidationError({"nova_senha": erro.detail}) from erro
        return attrs

