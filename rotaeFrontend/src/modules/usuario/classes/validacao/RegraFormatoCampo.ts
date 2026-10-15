import { RegraValidacao } from "./RegraValidacao";

// Composite (folha): o campo, quando preenchido, precisa seguir o formato esperado.
export class RegraFormatoCampo<Dados extends Record<string, string>> extends RegraValidacao<Dados> {
  constructor(
    private readonly campo: keyof Dados,
    private readonly formato: RegExp,
    private readonly mensagem: string,
  ) {
    super();
  }

  validar(dados: Dados) {
    const valor = dados[this.campo].trim();

    return !valor || this.formato.test(valor) ? {} : this.erro(this.campo, this.mensagem);
  }
}
