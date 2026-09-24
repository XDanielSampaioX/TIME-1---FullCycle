import { apiUrl } from "@/lib/api";
import type { Onibus } from "@/modules/onibus/types/onibus";

export async function buscarOnibus(id: number): Promise<Onibus> {
  const resposta = await fetch(apiUrl(`/api/onibus/${id}`));

  if (!resposta.ok) throw new Error("Não foi possível buscar o ônibus.");
  return resposta.json() as Promise<Onibus>;
}
