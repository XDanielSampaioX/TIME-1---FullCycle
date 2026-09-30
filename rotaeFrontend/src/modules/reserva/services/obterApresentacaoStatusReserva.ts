import { ApresentadorDeStatusReserva } from "@/modules/reserva/classes/ApresentadorDeStatusReserva";
import { ApresentadorPagamentoComFalha } from "@/modules/reserva/classes/ApresentadorPagamentoComFalha";
import { ApresentadorPagamentoPendente } from "@/modules/reserva/classes/ApresentadorPagamentoPendente";
import { ApresentadorReservaCancelada } from "@/modules/reserva/classes/ApresentadorReservaCancelada";
import { ApresentadorReservaExpirada } from "@/modules/reserva/classes/ApresentadorReservaExpirada";
import { ApresentadorReservaPaga } from "@/modules/reserva/classes/ApresentadorReservaPaga";
import type { StatusReserva } from "@/modules/reserva/types/reserva";

const apresentadores: ApresentadorDeStatusReserva[] = [
  new ApresentadorPagamentoPendente(),
  new ApresentadorReservaPaga(),
  new ApresentadorReservaExpirada(),
  new ApresentadorPagamentoComFalha(),
  new ApresentadorReservaCancelada(),
];

export function obterApresentacaoStatusReserva(statusDaReserva: StatusReserva) {
  const apresentador = apresentadores.find((item) => item.atende(statusDaReserva));
  
  if (!apresentador) {
    throw new Error(`Status de reserva não suportado: ${statusDaReserva}`);
  }
  
  return apresentador.obterApresentacao();
}
