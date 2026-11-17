import type { MetodoPagamento } from "./metodoPagamento";
import type { StatusPagamento } from "./statusPagamento";
import type { StatusReserva } from "./statusReserva";

// Resposta 201 do POST /reservas/{id}/pagamentos/: uma tentativa de pagamento da reserva.
export type Pagamento = {
  id: number;
  reservaId: number;
  // Como a reserva ficou depois da tentativa: PAGO, ainda pendente ou FALHA após 3 recusas.
  reservaStatus: StatusReserva;
  valorCentavos: number;
  status: StatusPagamento;
  metodoPagamento: MetodoPagamento;
  referenciaExterna: string;
  criadoEm: string;
  atualizadoEm: string;
};
