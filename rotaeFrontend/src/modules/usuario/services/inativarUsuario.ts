import { apiUrl } from "@/lib/api";

export async function inativarUsuario(accessToken: string): Promise<void> {
  const resposta = await fetch(apiUrl("/api/v1/me/"), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!resposta.ok) {
    throw new Error("Não foi possível desativar sua conta.");
  }
}