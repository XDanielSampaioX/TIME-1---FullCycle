import { apiUrl } from "@/lib/api";
import type { Cidade } from "@/modules/cidade/types/cidade";

export async function buscarCidade(id: number): Promise<Cidade> {
  const resposta = await fetch(apiUrl(`/api/cidades/${id}`));

  if (!resposta.ok) throw new Error("Não foi possível buscar a cidade.");
  return resposta.json() as Promise<Cidade>;
}
