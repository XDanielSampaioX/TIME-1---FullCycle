import { apiUrl } from "@/lib/api";
import type { Credenciais } from "../types/credenciais";
import type { Sessao } from "../types/sessao";

export async function entrar(credenciais: Credenciais): Promise<{ sessao: Sessao } | { erro: string }> {
  const resposta = await fetch(apiUrl("/api/v1/auth/login/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credenciais),
  });

  if (resposta.status === 401) {
    const corpo = await resposta.json() as { detail: string };
    return { erro: corpo.detail };
  }
  if (resposta.status === 400) return { erro: "Informe um e-mail e uma senha válidos." };
  if (!resposta.ok) throw new Error("Não foi possível entrar.");

  return { sessao: await resposta.json() as Sessao };
}
