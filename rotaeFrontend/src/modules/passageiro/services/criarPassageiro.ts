import { apiUrl } from "@/lib/api";
import type { Passageiro } from "@/modules/passageiro/types/passageiro";

export async function criarPassageiro(
  passageiro: Passageiro,
): Promise<Passageiro> {
  const resposta = await fetch(apiUrl("/api/passageiros"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(passageiro),
  });

  if (!resposta.ok) {
    throw new Error("Não foi possível criar o passageiro.");
  }

  return resposta.json() as Promise<Passageiro>;
}
