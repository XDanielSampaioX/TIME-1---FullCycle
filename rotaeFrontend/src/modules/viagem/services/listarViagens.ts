import type { Viagem } from "@/modules/viagem/types/viagem";
import { apiUrl } from "@/lib/api";

export async function listarViagens(): Promise<Viagem[]> {
  const resposta = await fetch(apiUrl("/api/viagens"));

  if (!resposta.ok) throw new Error("Não foi possível listar as viagens.");
  return resposta.json() as Promise<Viagem[]>;
}
