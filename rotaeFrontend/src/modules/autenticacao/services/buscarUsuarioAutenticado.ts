import { apiUrl } from "@/lib/api";
import type { Usuario } from "@/modules/usuario/types/usuario";
import { fetchAutenticado } from "./fetchAutenticado";

export async function buscarUsuarioAutenticado(): Promise<Usuario | null> {
  const resposta = await fetchAutenticado(apiUrl("/api/v1/me/"));

  if (resposta.status === 401) return null;
  if (!resposta.ok) throw new Error("Não foi possível carregar os dados do usuário.");

  return resposta.json() as Promise<Usuario>;
}
