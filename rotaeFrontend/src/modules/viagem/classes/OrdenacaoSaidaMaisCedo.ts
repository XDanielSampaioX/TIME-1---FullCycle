import { OrdenacaoViagem } from "./OrdenacaoViagem";
import type { ViagemDisponivel } from "../types/viagemDisponivel";

export class OrdenacaoSaidaMaisCedo extends OrdenacaoViagem {

  readonly id = "partida";
  readonly titulo = "Saída mais cedo";

  comparar(a: ViagemDisponivel, b: ViagemDisponivel): number {
    return Date.parse(a.viagem.partidaEm) - Date.parse(b.viagem.partidaEm);
  }
}
