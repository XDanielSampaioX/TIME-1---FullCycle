export type ViagemAssento = {
  id: number;
  viagemId: number;
  assentoId: number;
  numero: number;
  status: "DISPONIVEL" | "SEGURADO" | "RESERVADO";
};
