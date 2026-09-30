import { ApresentadorDeStatusReserva } from "@/modules/reserva/classes/ApresentadorDeStatusReserva";
import type { ApresentacaoStatusReserva } from "@/modules/reserva/types/apresentacaoStatusReserva";

export class ApresentadorReservaPaga extends ApresentadorDeStatusReserva {
  protected readonly status = "PAGO";

  obterApresentacao(): ApresentacaoStatusReserva {
    return {
      classe: "confirmada",
      titulo: "Reserva confirmada",
      descricao: "Bilhetes prontos para o embarque.",
      acaoPrincipal: "BILHETES",
    };
  }
}
