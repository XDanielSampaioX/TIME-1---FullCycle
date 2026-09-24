import type { Usuario } from "@/modules/usuario/types/usuario";
import { apiUrl } from "@/lib/api";

export async function listarUsuarios(): Promise<Usuario[]> {
  const resposta = await fetch(apiUrl("/api/usuarios"));

  if (!resposta.ok) throw new Error("Não foi possível listar os usuários.");
  return resposta.json() as Promise<Usuario[]>;
}
