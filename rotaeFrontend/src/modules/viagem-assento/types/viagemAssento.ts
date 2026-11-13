export type ViagemAssento = {
  id: number;
  viagemId: number;
  numero: number;
  status: "DISPONIVEL" | "SEGURADO" | "RESERVADO";
};
