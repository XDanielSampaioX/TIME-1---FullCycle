import type { Usuario } from "@/modules/usuario/types/usuario";
import { apiUrl } from "@/lib/api";

export async function criarUsuario(dados: Usuario): Promise<Usuario> {
  const resposta = await fetch(apiUrl("/api/usuarios"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  if (!resposta.ok) throw new Error("Não foi possível criar o usuário.");
  return resposta.json() as Promise<Usuario>;
}
