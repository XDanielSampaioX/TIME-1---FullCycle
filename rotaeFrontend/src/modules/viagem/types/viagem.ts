import type { Cidade } from "@/modules/cidade/types/cidade";
import type { Onibus } from "./Onibus";

export type ClasseViagem = "CONVENCIONAL" | "EXECUTIVA";
export type StatusViagem = "AGENDADA" | "COMPLETADA" | "CANCELADA";
export type ViagemDisponivel = Viagem;

export type Viagem = {
  id: number;
  origem: Cidade;
  destino: Cidade;
  onibus: Onibus;
  classe: ClasseViagem;
  partidaEm: string;
  chegadaEm: string;
  duracao: number;
  precoCentavos: number;
  status: StatusViagem;
  assentosLivres: number;
};
