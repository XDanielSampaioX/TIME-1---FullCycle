import type { PassagemResumo } from "./passagemResumo";
import type { PassageiroReserva } from "./passageiroReserva";
import type { Reserva } from "./reserva";

// O detalhe troca os nomes pelos dados completos de cada passageiro
// e traz as passagens emitidas.
export type ReservaDetalhe = Omit<Reserva, "passageiros"> & {
  passageiros: PassageiroReserva[];
  passagens: PassagemResumo[];
};
