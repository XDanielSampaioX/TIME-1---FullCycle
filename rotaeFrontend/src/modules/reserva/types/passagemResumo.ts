import type { StatusPassagem } from "./statusPassagem";

// Versão enxuta que a reserva traz para cada passagem.
export type PassagemResumo = {
  id: number;
  viagemAssentoId: number;
  passageiroId: number;
  status: StatusPassagem;
};
