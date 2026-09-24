import { apiUrl } from "@/lib/api";
import type { Passageiro } from "@/modules/passageiro/types/passageiro";

export async function listarPassageiros(): Promise<Passageiro[]> {
  const resposta = await fetch(apiUrl("/api/passageiros"));

  if (!resposta.ok) {
    throw new Error("Não foi possível listar os passageiros.");
  }

  return resposta.json() as Promise<Passageiro[]>;
}
