import type { CadastroUsuario } from "../types/cadastroUsuario";
import type { ErrosCadastroUsuario } from "../types/errosCadastroUsuario";
import { RegraCadastro } from "./RegraCadastro";

export class GrupoRegrasCadastro extends RegraCadastro {
  constructor(private readonly regras: RegraCadastro[]) {
    super();
  }

  validar(dados: CadastroUsuario) {
    const erros: ErrosCadastroUsuario = {};

    for (const regra of this.regras) {
      Object.assign(erros, { ...regra.validar(dados), ...erros });
    }

    return erros;
  }
}
