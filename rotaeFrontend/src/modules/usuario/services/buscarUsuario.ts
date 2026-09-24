import type { Usuario } from "@/modules/usuario/types/usuario";
import { apiUrl } from "@/lib/api";

export async function buscarUsuario(id: number): Promise<Usuario> {
  const resposta = await fetch(apiUrl(`/api/usuarios/${id}`));

  if (!resposta.ok) throw new Error("Não foi possível buscar o usuário.");
  return resposta.json() as Promise<Usuario>;
}
