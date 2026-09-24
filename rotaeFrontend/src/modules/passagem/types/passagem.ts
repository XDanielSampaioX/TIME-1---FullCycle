export const STATUS_PASSAGEM = ["CONFIRMADO", "CANCELADO"] as const;
export type StatusPassagem = (typeof STATUS_PASSAGEM)[number];

export type Passagem = {
  id?: number;
  reservaId: number;
  viagemAssentoId?: number;
  passageiroId?: number;
  status?: StatusPassagem;
  criadoEm?: string;
  atualizadoEm?: string;
};
