export type StatusReserva = "PAGAMENTO_PENDENTE" | "PAGO" | "EXPIRADO" | "FALHA" | "CANCELADO";

export type Reserva = {
  id?: number;
  usuarioId: number;
  viagemId: number;
  status: StatusReserva;
  valorTotal?: number;
  expiraEm?: string;
  criadoEm?: string;
  atualizadoEm?: string;
};
