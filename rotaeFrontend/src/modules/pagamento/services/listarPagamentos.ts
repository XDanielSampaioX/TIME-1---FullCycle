import { apiUrl } from "@/lib/api";
import type { Pagamento } from "@/modules/pagamento/types/pagamento";

export async function listarPagamentos(): Promise<Pagamento[]> {
  const resposta = await fetch(apiUrl("/api/pagamentos"));

  if (!resposta.ok) throw new Error("Não foi possível listar os pagamentos.");
  return resposta.json() as Promise<Pagamento[]>;
}
