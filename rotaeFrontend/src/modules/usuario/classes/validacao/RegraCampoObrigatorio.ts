import { RegraValidacao } from "./RegraValidacao";

// Composite (folha): o campo precisa estar preenchido.
export class RegraCampoObrigatorio<Dados extends Record<string, string>> extends RegraValidacao<Dados> {
  constructor(
    private readonly campo: keyof Dados,
    private readonly mensagem: string,
  ) {
    super();
  }

  validar(dados: Dados) {
    return dados[this.campo].trim() ? {} : this.erro(this.campo, this.mensagem);
  }
}
