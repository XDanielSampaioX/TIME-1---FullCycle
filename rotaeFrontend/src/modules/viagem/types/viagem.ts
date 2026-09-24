export type ClasseViagem = "CONVENCIONAL" | "EXECUTIVA";

export type StatusViagem = "AGENDADA" | "COMPLETADA" | "CANCELADA";

export type Viagem = {
  id?: number;
  onibusId: number;
  origemId: number;
  destinoId: number;
  classe?: ClasseViagem;
  partidaEm: string;
  chegadaEm: string;
  precoCentavos: number;
  status: StatusViagem;
  criadoEm: string;
  atualizadoEm: string;
};
