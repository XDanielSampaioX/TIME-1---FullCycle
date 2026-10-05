import type { ClasseViagem } from "./classeViagem";
import type { StatusViagem } from "./statusViagem";
import type { Cidade } from "@/modules/cidade/types/cidade";
import type { Onibus } from "./Onibus";

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
