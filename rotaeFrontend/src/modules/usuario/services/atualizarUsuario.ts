import type { Usuario } from "@/modules/usuario/types/usuario";
import type { AtualizacaoUsuarioPayload } from "@/modules/usuario/types/atualizacaoUsuarioPayload";
import { apiUrl } from "@/lib/api";

export async function atualizarUsuario(
  id: number,
  dados: AtualizacaoUsuarioPayload,
): Promise<Usuario> {
  const resposta = await fetch(apiUrl(`/api/usuarios/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  if (!resposta.ok) throw new Error("Não foi possível atualizar o usuário.");
  return resposta.json() as Promise<Usuario>;
}
