import { apiUrl } from "@/lib/api";
import type { Passagem } from "@/modules/passagem/types/passagem";

export async function buscarPassagem(id: number): Promise<Passagem> {
  const resposta = await fetch(apiUrl(`/api/passagens/${id}`));

  if (!resposta.ok) throw new Error("Não foi possível buscar a passagem.");
  return resposta.json() as Promise<Passagem>;
}
