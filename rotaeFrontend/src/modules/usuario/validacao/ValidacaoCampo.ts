import type { RegraValidacao } from "./RegraValidacao";
import type { ErrosCadastro } from "./errosCadastro";
import type { ValoresCadastro } from "./valoresCadastro";

// Folha do Composite: valida apenas um campo.
export class ValidacaoCampo implements RegraValidacao {
  constructor(
    private readonly campo: keyof ValoresCadastro,
    private readonly regra: (valor: string) => boolean,
    private readonly mensagem: string,
  ) {}

  validar(valores: ValoresCadastro): ErrosCadastro {
    if (this.regra(valores[this.campo])) return {};

    const erros: ErrosCadastro = {};
    erros[this.campo] = this.mensagem;
    return erros;
  }
}
