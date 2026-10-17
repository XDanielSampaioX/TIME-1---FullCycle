from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from viagens.models import ViagemAssento
from reservas.models import Reserva, ReservaAssento


class Command(BaseCommand):
    help = "Cancela reservas PENDENTE expiradas e libera os assentos de volta para DISPONIVEL"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Apenas mostra o que seria feito sem alterar o banco",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        agora = timezone.now()

        # Busca reservas PENDENTE que já expiraram
        reservas_expiradas = Reserva.objects.filter(
            status=Reserva.Status.PENDENTE,
            expira_em__lt=agora,
        ).select_related("viagem").prefetch_related("assentos_reserva__assento")

        count = reservas_expiradas.count()

        if count == 0:
            self.stdout.write(self.style.SUCCESS("Nenhuma reserva expirada encontrada."))
            return

        self.stdout.write(f"Encontradas {count} reserva(s) expirada(s).")

        if dry_run:
            for reserva in reservas_expiradas:
                assentos = [str(ra.assento.numero) for ra in reserva.assentos_reserva.all()]
                self.stdout.write(
                    f"  [DRY-RUN] Reserva #{reserva.id} (viagem {reserva.viagem_id}) "
                    f"expirou em {reserva.expira_em} - assentos: {', '.join(assentos)}"
                )
            return

        # Processa cada reserva expirada
        canceladas = 0
        assentos_liberados = 0

        with transaction.atomic():
            for reserva in reservas_expiradas:
                # Busca os ViagemAssento correspondentes
                viagem_assentos = ViagemAssento.objects.filter(
                    viagem=reserva.viagem,
                    assento__in=[ra.assento for ra in reserva.assentos_reserva.all()],
                    status=ViagemAssento.Status.SEGURADO,
                )

                # Libera os assentos
                liberados = viagem_assentos.update(status=ViagemAssento.Status.DISPONIVEL)
                assentos_liberados += liberados

                # Cancela a reserva
                reserva.status = Reserva.Status.CANCELADA
                reserva.save(update_fields=["status", "updated_at"])
                canceladas += 1

                self.stdout.write(
                    f"  Reserva #{reserva.id} cancelada - {liberados} assento(s) liberado(s)"
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Concluído: {canceladas} reserva(s) cancelada(s), "
                f"{assentos_liberados} assento(s) liberado(s)."
            )
        )