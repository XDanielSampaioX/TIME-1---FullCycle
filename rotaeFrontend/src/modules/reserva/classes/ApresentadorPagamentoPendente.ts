import { ApresentadorDeStatusReserva } from "@/modules/reserva/classes/ApresentadorDeStatusReserva";
import type { ApresentacaoStatusReserva } from "@/modules/reserva/types/apresentacaoStatusReserva";

export class ApresentadorPagamentoPendente extends ApresentadorDeStatusReserva {
  protected readonly status = "PAGAMENTO_PENDENTE";

  obterApresentacao(): ApresentacaoStatusReserva {
    return {
      classe: "pendente",
      titulo: "Aguardando pagamento",
      descricao: "Conclua o pagamento para garantir os seus assentos.",
      acaoPrincipal: "PAGAR",
    };
  }
}
