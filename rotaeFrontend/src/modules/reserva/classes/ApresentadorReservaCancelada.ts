import { ApresentadorDeStatusReserva } from "@/modules/reserva/classes/ApresentadorDeStatusReserva";
import type { ApresentacaoStatusReserva } from "@/modules/reserva/types/apresentacaoStatusReserva";

export class ApresentadorReservaCancelada extends ApresentadorDeStatusReserva {
  protected readonly status = "CANCELADO";

  obterApresentacao(): ApresentacaoStatusReserva {
    return {
      classe: "cancelada",
      titulo: "Reserva cancelada",
      descricao: "Esta reserva foi cancelada.",
      acaoPrincipal: "BUSCAR_NOVAMENTE",
    };
  }
}
