import { apiUrl } from "@/lib/api";
import type { Pagamento } from "@/modules/pagamento/types/pagamento";

export async function criarPagamento(dados: Pagamento): Promise<Pagamento> {
  const resposta = await fetch(apiUrl("/api/pagamentos"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  if (!resposta.ok) throw new Error("Não foi possível criar o pagamento.");
  return resposta.json() as Promise<Pagamento>;
}
