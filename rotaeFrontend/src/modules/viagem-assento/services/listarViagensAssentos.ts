import { apiUrl } from "@/lib/api";
import type { ViagemAssento } from "@/modules/viagem-assento/types/viagemAssento";

export async function listarViagensAssentos(): Promise<ViagemAssento[]> {
  const resposta = await fetch(apiUrl("/api/viagens_assentos"));

  if (!resposta.ok) throw new Error("Não foi possível listar os assentos da viagem.");
  return resposta.json() as Promise<ViagemAssento[]>;
}
