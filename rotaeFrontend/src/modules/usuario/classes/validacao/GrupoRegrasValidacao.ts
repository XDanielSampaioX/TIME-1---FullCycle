import type { ErrosValidacao } from "../../types/errosValidacao";
import { RegraValidacao } from "./RegraValidacao";

// Composite (grupo): também é uma RegraValidacao, então pode conter regras simples e outros grupos.
export class GrupoRegrasValidacao<Dados extends Record<string, string>> extends RegraValidacao<Dados> {
  constructor(private readonly regras: RegraValidacao<Dados>[]) {
    super();
  }

  validar(dados: Dados) {
    const erros: ErrosValidacao<Dados> = {};

    for (const regra of this.regras) {
      // Os erros já reunidos vêm por último: a primeira regra de cada campo define a mensagem.
      Object.assign(erros, { ...regra.validar(dados), ...erros });
    }

    return erros;
  }
}
