import type { ClasseViagem } from "./classeViagem";
import type { StatusViagem } from "./statusViagem";

export type Viagem = {
  id?: number;
  onibusId: number;
  origemId: number;
  destinoId: number;
  classe?: ClasseViagem;
  partidaEm: string;
  chegadaEm: string;
  precoCentavos: number;
  status: StatusViagem;
  criadoEm: string;
  atualizadoEm: string;
};
