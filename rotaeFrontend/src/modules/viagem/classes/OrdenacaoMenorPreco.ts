import { OrdenacaoViagem } from "./OrdenacaoViagem";

export class OrdenacaoMenorPreco extends OrdenacaoViagem {
  readonly id = "preco";
  readonly titulo = "Menor preço";
  readonly parametroApi = "preco";
}
