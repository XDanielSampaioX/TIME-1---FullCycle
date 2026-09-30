from django.db import models


class Cidade(models.Model):
    nome = models.CharField(max_length=100)
    uf = models.CharField(max_length=2)
    imagem_url = models.ImageField(upload_to="cidades", blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Cidades"
        ordering = ("nome",)

    def __str__(self):
        return f"{self.nome} - {self.uf}"
