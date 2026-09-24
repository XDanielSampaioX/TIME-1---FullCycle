import { apiUrl } from "@/lib/api";
import type { Cidade } from "@/modules/cidade/types/cidade";

export async function listarCidades(): Promise<Cidade[]> {
  const resposta = await fetch(apiUrl("/api/cidades"));

  if (!resposta.ok) throw new Error("Não foi possível listar as cidades.");
  return resposta.json() as Promise<Cidade[]>;
}
