import { apiUrl } from "@/lib/api";
import type { CadastroUsuario } from "../types/cadastroUsuario";
import type { ErrosValidacao } from "../types/errosValidacao";
import type { Usuario } from "../types/usuario";
import { lerErrosPorCampo } from "./lerErrosPorCampo";

// Os erros de cada campo voltam como dados; só uma falha inesperada (rede, servidor fora) vira exceção.
export async function cadastrarUsuario(
  dados: CadastroUsuario,
): Promise<{ usuario: Usuario } | { erros: ErrosValidacao<CadastroUsuario> }> {
  const resposta = await fetch(apiUrl("/api/v1/usuarios/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  if (resposta.status === 400) return { erros: await lerErrosPorCampo<CadastroUsuario>(resposta) };
  if (!resposta.ok) throw new Error("Não foi possível criar a conta.");

  return { usuario: await resposta.json() as Usuario };
}
