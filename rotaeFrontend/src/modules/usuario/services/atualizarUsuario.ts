import { apiUrl } from "@/lib/api";
import { fetchAutenticado } from "@/modules/autenticacao/services/fetchAutenticado";
import type { AtualizacaoUsuario } from "../types/atualizacaoUsuario";
import type { ErrosValidacao } from "../types/errosValidacao";
import type { Usuario } from "../types/usuario";
import { lerErrosPorCampo } from "./lerErrosPorCampo";

export async function atualizarUsuario(
  dados: AtualizacaoUsuario,
): Promise<{ usuario: Usuario } | { erros: ErrosValidacao<AtualizacaoUsuario> }> {
  const resposta = await fetchAutenticado(apiUrl("/api/v1/me/"), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  if (resposta.status === 400) return { erros: await lerErrosPorCampo<AtualizacaoUsuario>(resposta) };
  if (!resposta.ok) throw new Error("Não foi possível atualizar os dados.");

  return { usuario: await resposta.json() as Usuario };
}
