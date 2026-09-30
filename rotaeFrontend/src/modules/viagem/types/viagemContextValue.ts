import type { Assento } from "@/modules/assento/types/assento";
import type { Cidade } from "@/modules/cidade/types/cidade";
import type { ViagemAssento } from "@/modules/viagem-assento/types/viagemAssento";
import type { Viagem } from "./viagem";

export type ViagemContextValue = {
  viagens: Viagem[];
  cidades: Cidade[];
  assentos: Assento[];
  assentosViagens: ViagemAssento[];
  carregando: boolean;
  erro: string | null;
  recarregar: () => void;
};
