import { apiUrl } from "@/lib/api";
import type { CadastroUsuario } from "../types/cadastroUsuario";
import type { ErrosCadastroUsuario } from "../types/errosCadastroUsuario";
import type { Usuario } from "../types/usuario";

export async function cadastrarUsuario(
  dados: CadastroUsuario,
): Promise<{ usuario: Usuario } | { erros: ErrosCadastroUsuario }> {
  const resposta = await fetch(apiUrl("/api/v1/usuarios/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  if (resposta.status === 400) {
    // O backend devolve uma lista de mensagens por campo; a tela mostra a primeira.
    const corpo = await resposta.json() as Record<string, string[]>;
    return { erros: Object.fromEntries(Object.entries(corpo).map(([campo, mensagens]) => [campo, mensagens[0]])) };
  }
  if (!resposta.ok) throw new Error("Não foi possível criar a conta.");

  return { usuario: await resposta.json() as Usuario };
}
