import { apiUrl } from "@/lib/api";
import type { AtualizacaoUsuarioPayload } from "@/modules/usuario/types/atualizacaoUsuarioPayload";
import type { Usuario } from "@/modules/usuario/types/usuario";

export async function atualizarUsuario(
  dados: AtualizacaoUsuarioPayload,
  accessToken: string,
): Promise<Usuario> {
  const resposta = await fetch(apiUrl("/api/v1/me/"), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(dados),
  });

  if (!resposta.ok) {
    throw new Error("Não foi possível atualizar o usuário.");
  }

  return resposta.json() as Promise<Usuario>;
}
