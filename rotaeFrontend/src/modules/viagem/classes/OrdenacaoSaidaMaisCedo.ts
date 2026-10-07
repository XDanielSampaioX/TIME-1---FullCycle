import { OrdenacaoViagem } from "./OrdenacaoViagem";

export class OrdenacaoSaidaMaisCedo extends OrdenacaoViagem {
  readonly id = "partida";
  readonly titulo = "Saída mais cedo";
  readonly parametroApi = "partida";
}
