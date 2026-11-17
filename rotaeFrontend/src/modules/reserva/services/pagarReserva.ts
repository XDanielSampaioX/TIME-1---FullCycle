import { apiUrl } from "@/lib/api";
import { fetchAutenticado } from "@/modules/autenticacao/services/fetchAutenticado";
import { PagamentoRecusadoError } from "../classes/PagamentoRecusadoError";
import type { MetodoPagamento } from "../types/metodoPagamento";
import type { Pagamento } from "../types/pagamento";

// Paga a reserva pelo gateway simulado do backend. O valor é calculado no servidor.
// Devolve a tentativa (APROVADO ou NEGADO) ou null quando o provedor falhou (502): o backend
// registra essa tentativa como recusada, então a tela trata como pagamento não aprovado.
export async function pagarReserva(reservaId: number, metodoPagamento: MetodoPagamento): Promise<Pagamento | null> {
  const resposta = await fetchAutenticado(apiUrl(`/api/v1/reservas/${reservaId}/pagamentos/`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ metodoPagamento }),
  });

  if (resposta.status === 502) return null;

  if (!resposta.ok) {
    // 409: reserva paga, expirada, em FALHA, sem passageiros ou com outro pagamento em andamento.
    const corpo = await resposta.json().catch(() => null) as { detail?: string } | null;
    throw new PagamentoRecusadoError(corpo?.detail ?? "Não foi possível concluir o pagamento.");
  }

  return await resposta.json() as Pagamento;
}
