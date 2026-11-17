import type { ViagemAssento } from "@/modules/viagem-assento/types/viagemAssento";
import type { Viagem } from "@/modules/viagem/types/viagem";
import type { StatusReserva } from "./statusReserva";

export type Reserva = {
  id: number;
  // O backend só calcula assentosLivres nas rotas de viagens.
  viagem: Omit<Viagem, "assentosLivres">;
  status: StatusReserva;
  valorTotal: number;
  expiraEm: string;
  assentos: Omit<ViagemAssento, "viagemId">[];
  // A listagem traz só o nome de cada passageiro.
  passageiros: string[];
  totalAssentos: number;
  criadoEm: string;
  atualizadoEm: string;
};
