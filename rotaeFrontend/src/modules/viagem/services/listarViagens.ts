import type { Viagem } from "@/modules/viagem/types/viagem";
import { buscarPagina } from "@/lib/api";
import type { Pagina } from "@/shared/types/pagina";

export async function listarViagens(caminhoOuUrl = "/api/v1/viagens/"): Promise<Pagina<Viagem>> {
  return buscarPagina<Viagem>(caminhoOuUrl, "Não foi possível listar as viagens.");
}
