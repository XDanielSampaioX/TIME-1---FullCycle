from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

from .validators import validar_celular, validar_cpf, validar_data_nascimento


class UsuarioManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("O e-mail é obrigatório.")
        usuario = self.model(email=self.normalize_email(email).strip().lower(), **extra_fields)
        usuario.set_password(password)
        usuario.save(using=self._db)
        return usuario

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields["is_staff"] = True
        extra_fields["is_superuser"] = True
        return self._create_user(email, password, **extra_fields)

    def get_by_natural_key(self, email):
        # E-mails são gravados em minúsculas; o login do admin também deve ignorar a caixa.
        return super().get_by_natural_key((email or "").strip().lower())


class Usuario(AbstractBaseUser, PermissionsMixin):
    nome = models.CharField(max_length=150)
    email = models.EmailField(
        unique=True,
        error_messages={"unique": "Já existe um usuário com este e-mail."},
    )
    # O modelo de dados chama a coluna de senha_hash; o Django guarda só o hash.
    password = models.CharField("senha", max_length=128, db_column="senha_hash")
    celular = models.CharField(max_length=11, blank=True, validators=[validar_celular])
    data_nasc = models.DateField(null=True, blank=True, validators=[validar_data_nascimento])
    # Nulo só para contas administrativas criadas pelo createsuperuser; a API exige o CPF.
    cpf = models.CharField(
        max_length=11,
        unique=True,
        null=True,
        blank=True,
        validators=[validar_cpf],
        error_messages={"unique": "Já existe um usuário com este CPF."},
    )
    # O Django e o simplejwt consultam is_active (inclusive no banco); a coluna segue o modelo de dados.
    is_active = models.BooleanField("ativo", default=True, db_column="ativo")
    is_staff = models.BooleanField("acesso ao admin", default=False)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    objects = UsuarioManager()

    USERNAME_FIELD = "email"
    EMAIL_FIELD = "email"
    REQUIRED_FIELDS = ["nome"]

    class Meta:
        verbose_name = "Usuário"
        verbose_name_plural = "Usuários"
        ordering = ("nome",)

    def __str__(self):
        return f"{self.nome} <{self.email}>"
