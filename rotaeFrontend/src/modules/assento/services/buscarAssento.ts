import { apiUrl } from "@/lib/api";
import type { Assento } from "@/modules/assento/types/assento";

export async function buscarAssento(id: number): Promise<Assento> {
  const resposta = await fetch(apiUrl(`/api/assentos/${id}`));

  if (!resposta.ok) throw new Error("Não foi possível buscar o assento.");
  return resposta.json() as Promise<Assento>;
}
