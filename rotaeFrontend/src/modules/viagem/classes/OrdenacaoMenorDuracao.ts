import { OrdenacaoViagem } from "./OrdenacaoViagem";

export class OrdenacaoMenorDuracao extends OrdenacaoViagem {
  readonly id = "duracao";
  readonly titulo = "Menor duração";
  readonly parametroApi = "duracao";
}
