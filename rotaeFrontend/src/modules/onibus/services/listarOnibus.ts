import { apiUrl } from "@/lib/api";
import type { Onibus } from "@/modules/onibus/types/onibus";

export async function listarOnibus(): Promise<Onibus[]> {
  const resposta = await fetch(apiUrl("/api/onibus"));

  if (!resposta.ok) throw new Error("Não foi possível listar os ônibus.");
  return resposta.json() as Promise<Onibus[]>;
}
