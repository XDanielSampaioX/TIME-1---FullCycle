import type { ViagemDisponivel } from "../types/viagemDisponivel";

export abstract class OrdenacaoViagem {
  abstract readonly id: string;
  abstract readonly titulo: string;
  abstract comparar(a: ViagemDisponivel, b: ViagemDisponivel): number;
}
