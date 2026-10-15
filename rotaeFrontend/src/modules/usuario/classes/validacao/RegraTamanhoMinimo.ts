import { RegraValidacao } from "./RegraValidacao";

// Composite (folha): o campo, quando preenchido, precisa ter ao menos N caracteres.
// Não remove espaços: numa senha, eles contam.
export class RegraTamanhoMinimo<Dados extends Record<string, string>> extends RegraValidacao<Dados> {
  constructor(
    private readonly campo: keyof Dados,
    private readonly minimo: number,
    private readonly mensagem: string,
  ) {
    super();
  }

  validar(dados: Dados) {
    const valor = dados[this.campo];

    return !valor || valor.length >= this.minimo ? {} : this.erro(this.campo, this.mensagem);
  }
}
