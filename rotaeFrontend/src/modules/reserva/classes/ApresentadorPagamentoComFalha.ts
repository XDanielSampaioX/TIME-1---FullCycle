import { ApresentadorDeStatusReserva } from "@/modules/reserva/classes/ApresentadorDeStatusReserva";
import type { ApresentacaoStatusReserva } from "@/modules/reserva/types/apresentacaoStatusReserva";

export class ApresentadorPagamentoComFalha extends ApresentadorDeStatusReserva {
  protected readonly status = "FALHA";

  obterApresentacao(): ApresentacaoStatusReserva {
    return {
      classe: "falha",
      titulo: "Pagamento não aprovado",
      descricao: "Você pode tentar outra forma de pagamento.",
      acaoPrincipal: "TENTAR_NOVAMENTE",
    };
  }
}
