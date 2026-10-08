from django.urls import path

from .views import AlterarSenhaView, CadastroUsuarioView, LoginView, LogoutView, MeView, RefreshView

urlpatterns = [
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/refresh/", RefreshView.as_view(), name="refresh_token"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("usuarios/", CadastroUsuarioView.as_view(), name="cadastro_usuario"),
    path("me/", MeView.as_view(), name="me"),
    path("me/senha/", AlterarSenhaView.as_view(), name="alterar_senha"),
]
