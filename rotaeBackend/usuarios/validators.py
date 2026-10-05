import re

from django.core.exceptions import ValidationError
from django.utils import timezone


def so_digitos(valor):
    return re.sub(r"\D", "", valor or "")


def _digito_verificador(digitos):
    peso_inicial = len(digitos) + 1
    soma = sum(int(digito) * (peso_inicial - i) for i, digito in enumerate(digitos))
    resto = soma % 11
    return "0" if resto < 2 else str(11 - resto)


def validar_cpf(valor):
    if not re.fullmatch(r"\d{11}", valor or "") or valor == valor[0] * 11:
        raise ValidationError("CPF inválido.", code="cpf_invalido")

    primeiro = _digito_verificador(valor[:9])
    segundo = _digito_verificador(valor[:9] + primeiro)
    if valor[9:] != primeiro + segundo:
        raise ValidationError("CPF inválido.", code="cpf_invalido")


def validar_celular(valor):
    if not re.fullmatch(r"\d{10,11}", valor or ""):
        raise ValidationError("Celular deve ter DDD e 10 ou 11 dígitos.", code="celular_invalido")


def validar_data_nascimento(valor):
    if valor and valor > timezone.localdate():
        raise ValidationError("Data de nascimento não pode estar no futuro.", code="data_nasc_futura")
