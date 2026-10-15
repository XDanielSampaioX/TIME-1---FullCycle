import type { CadastroUsuario } from "../types/cadastroUsuario";
import { RegraCadastro } from "./RegraCadastro";

// Composite (folha): o campo precisa estar preenchido.
export class RegraCampoObrigatorio extends RegraCadastro {
  constructor(
    private readonly campo: keyof CadastroUsuario,
    private readonly mensagem: string,
  ) {
    super();
  }

  validar(dados: CadastroUsuario) {
    return dados[this.campo].trim() ? {} : { [this.campo]: this.mensagem };
  }
}
