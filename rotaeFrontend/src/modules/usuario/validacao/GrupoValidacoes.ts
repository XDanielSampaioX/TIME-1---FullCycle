import type { RegraValidacao } from "./RegraValidacao";
import type { ErrosCadastro } from "./errosCadastro";
import type { ValoresCadastro } from "./valoresCadastro";

// Grupo do Composite: aceita regras simples e outros grupos.
export class GrupoValidacoes implements RegraValidacao {
  constructor(private readonly regras: readonly RegraValidacao[]) {}

  validar(valores: ValoresCadastro): ErrosCadastro {
    const erros: ErrosCadastro = {};
    for (const regra of this.regras) {
      Object.assign(erros, regra.validar(valores));
    }
    return erros;
  }
}
