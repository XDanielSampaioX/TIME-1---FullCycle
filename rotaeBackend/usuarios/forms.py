from django.contrib.auth.forms import BaseUserCreationForm, UserChangeForm

from .models import Usuario


class UsuarioCreationForm(BaseUserCreationForm):
    class Meta:
        model = Usuario
        fields = ("email", "nome")

    def clean_email(self):
        return self.cleaned_data["email"].strip().lower()


class UsuarioChangeForm(UserChangeForm):
    class Meta:
        model = Usuario
        fields = "__all__"

    def clean_email(self):
        return self.cleaned_data["email"].strip().lower()
