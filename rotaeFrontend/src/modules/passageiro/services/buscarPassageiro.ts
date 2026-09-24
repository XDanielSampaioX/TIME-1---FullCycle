import { apiUrl } from "@/lib/api";
import type { Passageiro } from "@/modules/passageiro/types/passageiro";

export async function buscarPassageiro(id: number): Promise<Passageiro> {
  const resposta = await fetch(apiUrl(`/api/passageiros/${id}`));

  if (!resposta.ok) {
    throw new Error("Não foi possível buscar o passageiro.");
  }

  return resposta.json() as Promise<Passageiro>;
}
