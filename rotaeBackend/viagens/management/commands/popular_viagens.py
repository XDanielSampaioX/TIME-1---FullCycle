from datetime import datetime, time, timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from viagens.models import Cidade, Onibus, Viagem
from viagens.services import gerar_assentos_da_viagem

CIDADES = (
    ("Fortaleza", "CE"),
    ("Juazeiro do Norte", "CE"),
    ("Sobral", "CE"),
    ("Teresina", "PI"),
)

ONIBUS = (
    ("RT-001", 40, "Marcopolo G8"),
    ("RT-002", 32, "Mercedes-Benz O-500"),
)

# (origem, destino, identificação do ônibus, classe, horário de partida, duração em minutos, preço em centavos)
VIAGENS = (
    ("Fortaleza", "Juazeiro do Norte", "RT-001", Viagem.Classe.CONVENCIONAL, time(8, 0), 270, 8990),
    ("Fortaleza", "Juazeiro do Norte", "RT-002", Viagem.Classe.EXECUTIVA, time(22, 0), 480, 12990),
    ("Fortaleza", "Sobral", "RT-002", Viagem.Classe.EXECUTIVA, time(14, 0), 255, 7490),
    ("Juazeiro do Norte", "Fortaleza", "RT-001", Viagem.Classe.CONVENCIONAL, time(22, 0), 480, 12990),
    ("Fortaleza", "Teresina", "RT-001", Viagem.Classe.CONVENCIONAL, time(5, 30), 600, 15990),
)


class Command(BaseCommand):
    help = "Cria cidades, ônibus e viagens de exemplo para os próximos dias."

    def add_arguments(self, parser):
        parser.add_argument("--dias", type=int, default=7, help="Quantidade de dias com viagens (padrão: 7).")

    @transaction.atomic
    def handle(self, *args, **options):
        cidades = {
            nome: Cidade.objects.get_or_create(nome=nome, uf=uf)[0]
            for nome, uf in CIDADES
        }
        onibus = {
            identificacao: Onibus.objects.get_or_create(
                identificacao=identificacao,
                defaults={"total_assentos": total_assentos, "modelo": modelo},
            )[0]
            for identificacao, total_assentos, modelo in ONIBUS
        }

        criadas = 0
        hoje = timezone.localdate()
        for dia in range(1, options["dias"] + 1):
            data = hoje + timedelta(days=dia)
            for origem, destino, identificacao, classe, horario, duracao, preco in VIAGENS:
                partida = timezone.make_aware(datetime.combine(data, horario))
                viagem, criada = Viagem.objects.get_or_create(
                    origem=cidades[origem],
                    destino=cidades[destino],
                    partida_em=partida,
                    defaults={
                        "onibus": onibus[identificacao],
                        "classe": classe,
                        "chegada_em": partida + timedelta(minutes=duracao),
                        "preco_centavos": preco,
                    },
                )
                gerar_assentos_da_viagem(viagem)
                criadas += criada

        self.stdout.write(self.style.SUCCESS(f"{criadas} viagem(ns) criada(s)."))
