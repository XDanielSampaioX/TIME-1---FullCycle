export const STATUS_PAGAMENTO = ["PENDENTE", "APROVADO", "NEGADO"] as const;
export type StatusPagamento = (typeof STATUS_PAGAMENTO)[number];

export const METODOS_PAGAMENTO = ["PIX", "CARTAO"] as const;
export type MetodoPagamento = (typeof METODOS_PAGAMENTO)[number];

export type Pagamento = {
  id?: number;
  reservaId: number;
  valorCentavos: number;
  status: StatusPagamento;
  referenciaExterna: string;
  metodoPagamento?: MetodoPagamento;
  criadoEm?: string;
  atualizadoEm?: string;
};
