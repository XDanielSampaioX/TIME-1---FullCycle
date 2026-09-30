export type ViagemAssento = {
  id?: number;
  viagemId: number;
  assentoId: number;
  status: "DISPONIVEL" | "SEGURADO" | "RESERVADO";
  reservaId?: number | null;
};
