import type { RegraValidacao } from "./RegraValidacao";
import type { ErrosCadastro } from "./errosCadastro";
import type { CadastroUsuarioPayload, CampoCadastro } from "@/modules/usuario/types/cadastroUsuarioPayload";

// Folha do Composite: valida apenas um campo.
export class ValidacaoCampo implements RegraValidacao {
  constructor(
    private readonly campo: CampoCadastro,
    private readonly regra: (valor: string) => boolean,
    private readonly mensagem: string,
  ) {}

  validar(valores: CadastroUsuarioPayload): ErrosCadastro {
    if (this.regra(valores[this.campo])) return {};

    const erros: ErrosCadastro = {};
    erros[this.campo] = this.mensagem;
    return erros;
  }
}
