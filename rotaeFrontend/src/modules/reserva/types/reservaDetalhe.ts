import type { PassageiroReserva } from "./passageiroReserva";
import type { Reserva } from "./reserva";

export type ReservaDetalhe = Reserva & {
  passageiros: PassageiroReserva[];
};
