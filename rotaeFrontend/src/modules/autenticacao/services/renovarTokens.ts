import { apiUrl } from "@/lib/api";
import { Tokens } from "../types/sessao";

export async function renovarTokens(refresh: string): Promise<Tokens | null> {
  const resposta = await fetch(apiUrl("/api/v1/auth/refresh/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (resposta.status === 401) return null;
  if (!resposta.ok) throw new Error("Não foi possível renovar a sessão.");

  return resposta.json() as Promise<Tokens>;
}
