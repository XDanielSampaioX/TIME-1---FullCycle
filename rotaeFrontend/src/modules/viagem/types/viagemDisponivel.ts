import type { Cidade } from "@/modules/cidade/types/cidade";
import type { Viagem } from "./viagem";

export type ViagemDisponivel = {
  viagem: Viagem;
  origem: Cidade;
  destino: Cidade;
  assentosLivres: number;
};
