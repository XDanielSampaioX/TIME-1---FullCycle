import { apiUrl } from "@/lib/api";
import type { Assento } from "@/modules/assento/types/assento";

export async function listarAssentos(): Promise<Assento[]> {
  const resposta = await fetch(apiUrl("/api/assentos"));

  if (!resposta.ok) throw new Error("Não foi possível listar os assentos.");
  return resposta.json() as Promise<Assento[]>;
}
