import type { ErrosCadastro } from "./errosCadastro";
import type { ValoresCadastro } from "./valoresCadastro";

// O mesmo contrato serve para uma regra simples ou para um grupo de regras.
export interface RegraValidacao {
  validar(valores: ValoresCadastro): ErrosCadastro;
}
