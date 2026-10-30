import { apiUrl } from "@/lib/api";
import { fetchAutenticado } from "@/modules/autenticacao/services/fetchAutenticado";

// O backend desativa a conta (sem apagar o histórico) e revoga os refresh tokens.
export async function excluirConta() {
  const resposta = await fetchAutenticado(apiUrl("/api/v1/me/"), { method: "DELETE" });

  if (!resposta.ok) throw new Error("Não foi possível excluir a conta.");
}
