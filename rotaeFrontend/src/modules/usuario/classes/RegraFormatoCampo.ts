import type { CadastroUsuario } from "../types/cadastroUsuario";
import { RegraCadastro } from "./RegraCadastro";

// Composite (folha): o campo, quando preenchido, precisa seguir o formato esperado.
export class RegraFormatoCampo extends RegraCadastro {
  constructor(
    private readonly campo: keyof CadastroUsuario,
    private readonly formato: RegExp,
    private readonly mensagem: string,
  ) {
    super();
  }

  validar(dados: CadastroUsuario) {
    const valor = dados[this.campo].trim();

    return !valor || this.formato.test(valor) ? {} : { [this.campo]: this.mensagem };
  }
}
