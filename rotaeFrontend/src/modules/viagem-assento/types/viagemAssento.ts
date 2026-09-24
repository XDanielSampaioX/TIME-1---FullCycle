export type StatusViagemAssento = "DISPONIVEL" | "SEGURADO" | "VENDIDO";

export type ViagemAssento = {
  id?: number;
  viagemId: number;
  assentoId: number;
  status: StatusViagemAssento;
  pedidoId?: number | null;
};
