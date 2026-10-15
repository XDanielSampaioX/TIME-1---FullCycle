import { RegraValidacao } from "./RegraValidacao";

// Composite (folha): o campo, quando preenchido, precisa ser igual a outro campo.
export class RegraCamposIguais<Dados extends Record<string, string>> extends RegraValidacao<Dados> {
  constructor(
    private readonly campo: keyof Dados,
    private readonly campoReferencia: keyof Dados,
    private readonly mensagem: string,
  ) {
    super();
  }

  validar(dados: Dados) {
    const valor = dados[this.campo];

    return !valor || valor === dados[this.campoReferencia] ? {} : this.erro(this.campo, this.mensagem);
  }
}
