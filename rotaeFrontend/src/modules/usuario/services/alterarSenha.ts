import { apiUrl } from "@/lib/api";
import { fetchAutenticado } from "@/modules/autenticacao/services/fetchAutenticado";
import type { Tokens } from "@/modules/autenticacao/types/sessao";
import type { AlteracaoSenha } from "../types/alteracaoSenha";
import type { ErrosValidacao } from "../types/errosValidacao";
import { lerErrosPorCampo } from "./lerErrosPorCampo";

// A troca derruba as sessões antigas: o backend devolve tokens novos para a sessão atual.
export async function alterarSenha(
  dados: AlteracaoSenha,
): Promise<{ tokens: Tokens } | { erros: ErrosValidacao<AlteracaoSenha> }> {
  const resposta = await fetchAutenticado(apiUrl("/api/v1/me/senha/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  if (resposta.status === 400) return { erros: await lerErrosPorCampo<AlteracaoSenha>(resposta) };
  if (!resposta.ok) throw new Error("Não foi possível alterar a senha.");

  return { tokens: await resposta.json() as Tokens };
}
