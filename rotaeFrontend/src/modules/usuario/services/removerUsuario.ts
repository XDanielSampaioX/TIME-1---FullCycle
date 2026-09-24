import { apiUrl } from "@/lib/api";

export async function removerUsuario(id: number): Promise<void> {
  const resposta = await fetch(apiUrl(`/api/usuarios/${id}`), { method: "DELETE" });

  if (!resposta.ok) throw new Error("Não foi possível remover o usuário.");
}
