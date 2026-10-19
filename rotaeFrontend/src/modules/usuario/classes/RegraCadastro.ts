import type { CadastroUsuario } from "../types/cadastroUsuario";
import type { ErrosCadastroUsuario } from "../types/errosCadastroUsuario";

// Composite (contrato comum): uma regra sozinha e um grupo de regras são validados do mesmo jeito.
export abstract class RegraCadastro {
  abstract validar(dados: CadastroUsuario): ErrosCadastroUsuario;
}
