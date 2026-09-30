import { OrdenacaoViagem } from "./OrdenacaoViagem";
import type { ViagemDisponivel } from "../types/viagemDisponivel";

export class OrdenacaoMenorDuracao extends OrdenacaoViagem {

  readonly id = "duracao";
  readonly titulo = "Menor duração";

  comparar(a: ViagemDisponivel, b: ViagemDisponivel): number {
    return (Date.parse(a.viagem.chegadaEm) - Date.parse(a.viagem.partidaEm))
      - (Date.parse(b.viagem.chegadaEm) - Date.parse(b.viagem.partidaEm));
  }
}
