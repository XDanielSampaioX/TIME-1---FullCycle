import type { ErrosCadastro } from "./errosCadastro";
import type { CadastroUsuarioPayload } from "@/modules/usuario/types/cadastroUsuarioPayload";

// O mesmo contrato serve para uma regra simples ou para um grupo de regras.
export interface RegraValidacao {
  validar(valores: CadastroUsuarioPayload): ErrosCadastro;
}
