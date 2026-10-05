import type { Cidade } from "@/modules/cidade/types/cidade";
import type { Viagem } from "./viagem";
import type { Pagina } from "@/shared/types/pagina";

export type ViagemContextValue = {
  viagens: Viagem[];
  paginaViagens: Pagina<Viagem> | null;
  cidades: Cidade[];
  cidadesCarregadas: boolean;
  carregando: boolean;
  erro: string | null;
  recarregar: () => void;
  navegarPaginaViagens: (url: string) => void;
  consultarViagens: (parametros: URLSearchParams) => void;
};
