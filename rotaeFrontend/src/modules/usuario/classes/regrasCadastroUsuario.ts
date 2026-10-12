import { GrupoRegrasCadastro } from "./GrupoRegrasCadastro";
import { RegraCampoObrigatorio } from "./RegraCampoObrigatorio";
import { RegraFormatoCampo } from "./RegraFormatoCampo";

// Checagens rápidas antes do envio. As regras definitivas (dígitos do CPF, força da senha,
// e-mail/CPF já cadastrados) são do backend, que devolve a mensagem de cada campo.
// Para validar algo novo, crie uma classe que estenda RegraCadastro e adicione-a aqui.
const regrasDadosPessoais = new GrupoRegrasCadastro([
  new RegraCampoObrigatorio("nome", "Informe seu nome."),
  new RegraCampoObrigatorio("cpf", "Informe seu CPF."),
  new RegraFormatoCampo("cpf", /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF deve ter 11 dígitos."),
  new RegraCampoObrigatorio("dataNasc", "Informe sua data de nascimento."),
  new RegraCampoObrigatorio("celular", "Informe seu celular."),
  new RegraFormatoCampo("celular", /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, "Celular deve ter DDD e 10 ou 11 dígitos."),
]);

const regrasDadosAcesso = new GrupoRegrasCadastro([
  new RegraCampoObrigatorio("email", "Informe seu e-mail."),
  new RegraFormatoCampo("email", /^\S+@\S+\.\S+$/, "Informe um e-mail válido."),
  new RegraCampoObrigatorio("senha", "Informe uma senha."),
  new RegraFormatoCampo("senha", /^.{8,}$/, "A senha deve ter pelo menos 8 caracteres."),
]);

export const regrasCadastroUsuario = new GrupoRegrasCadastro([regrasDadosPessoais, regrasDadosAcesso]);
