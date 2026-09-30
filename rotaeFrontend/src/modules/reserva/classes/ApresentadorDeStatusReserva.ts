import type { ApresentacaoStatusReserva } from "@/modules/reserva/types/apresentacaoStatusReserva";
import type { StatusReserva } from "@/modules/reserva/types/reserva";

export abstract class ApresentadorDeStatusReserva {
  protected abstract readonly status: StatusReserva;

  atende(status: StatusReserva) {
    return this.status === status;
  }

  abstract obterApresentacao(): ApresentacaoStatusReserva;
}
