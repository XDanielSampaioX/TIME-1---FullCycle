import { apiUrl } from "@/lib/api";
import type { Passagem } from "@/modules/passagem/types/passagem";

export async function criarPassagem(passagem: Passagem): Promise<Passagem> {
  const resposta = await fetch(apiUrl("/api/passagens"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(passagem),
  });

  if (!resposta.ok) throw new Error("Não foi possível criar a passagem.");
  return resposta.json() as Promise<Passagem>;
}
