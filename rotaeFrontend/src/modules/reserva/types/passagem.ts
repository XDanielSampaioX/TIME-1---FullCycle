import type { ViagemAssento } from "@/modules/viagem-assento/types/viagemAssento";
import type { PassageiroReserva } from "./passageiroReserva";
import type { Reserva } from "./reserva";
import type { StatusPassagem } from "./statusPassagem";

export type Passagem = {
  id: number;
  reservaId: number;
  viagem: Pick<Reserva["viagem"], "origem" | "destino" | "partidaEm" | "chegadaEm">;
  viagemAssento: Pick<ViagemAssento, "id" | "numero">;
  passageiro: PassageiroReserva;
  status: StatusPassagem;
  criadoEm: string;
  atualizadoEm: string;
};
