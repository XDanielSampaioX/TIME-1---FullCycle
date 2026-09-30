import { ApresentadorDeStatusReserva } from "@/modules/reserva/classes/ApresentadorDeStatusReserva";
import type { ApresentacaoStatusReserva } from "@/modules/reserva/types/apresentacaoStatusReserva";

export class ApresentadorReservaExpirada extends ApresentadorDeStatusReserva {
  protected readonly status = "EXPIRADO";

  obterApresentacao(): ApresentacaoStatusReserva {
    return {
      classe: "expirada",
      titulo: "Prazo expirado",
      descricao: "O pagamento não foi concluído a tempo.",
      acaoPrincipal: "BUSCAR_NOVAMENTE",
    };
  }
}
