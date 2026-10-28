import re

# Os validadores brasileiros ficam em core; a reexportação mantém os imports e a migration 0001 de usuarios.
from core.validators import validar_celular, validar_cpf, validar_data_nascimento

__all__ = ["so_digitos", "validar_celular", "validar_cpf", "validar_data_nascimento"]


def so_digitos(valor):
    return re.sub(r"\D", "", valor or "")
