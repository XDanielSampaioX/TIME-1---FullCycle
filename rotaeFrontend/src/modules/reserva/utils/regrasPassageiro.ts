import { GrupoRegrasValidacao } from "@/modules/usuario/classes/validacao/GrupoRegrasValidacao";
import { RegraCampoObrigatorio } from "@/modules/usuario/classes/validacao/RegraCampoObrigatorio";
import { RegraFormatoCampo } from "@/modules/usuario/classes/validacao/RegraFormatoCampo";
import type { DadosPassageiro } from "../types/dadosPassageiro";

// Checagens rápidas antes do envio. As regras definitivas (dígitos do CPF, data futura)
// são do backend, que devolve a mensagem de cada campo de cada passageiro.
export const regrasPassageiro = new GrupoRegrasValidacao<DadosPassageiro>([
  new RegraCampoObrigatorio("nome", "Informe o nome."),
  new RegraCampoObrigatorio("cpf", "Informe o CPF."),
  new RegraFormatoCampo("cpf", /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF deve ter 11 dígitos."),
  new RegraCampoObrigatorio("dataNasc", "Informe a data de nascimento."),
  new RegraCampoObrigatorio("celular", "Informe o celular."),
  new RegraFormatoCampo("celular", /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, "Celular deve ter DDD e 10 ou 11 dígitos."),
  new RegraCampoObrigatorio("email", "Informe o e-mail."),
  new RegraFormatoCampo("email", /^\S+@\S+\.\S+$/, "Informe um e-mail válido."),
]);
