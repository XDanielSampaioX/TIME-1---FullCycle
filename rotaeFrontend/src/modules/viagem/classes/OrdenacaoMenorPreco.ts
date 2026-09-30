import { OrdenacaoViagem } from "./OrdenacaoViagem";
import type { ViagemDisponivel } from "../types/viagemDisponivel";

export class OrdenacaoMenorPreco extends OrdenacaoViagem {

  readonly id = "preco";
  readonly titulo = "Menor preço";

  comparar(a: ViagemDisponivel, b: ViagemDisponivel): number {
    return a.viagem.precoCentavos - b.viagem.precoCentavos;
  }
}
