import { apiUrl } from "@/lib/api";
import type { Passagem } from "@/modules/passagem/types/passagem";

export async function listarPassagens(): Promise<Passagem[]> {
  const resposta = await fetch(apiUrl("/api/passagens"));

  if (!resposta.ok) throw new Error("Não foi possível listar as passagens.");
  return resposta.json() as Promise<Passagem[]>;
}
