import type { CamposCadastro } from "../../types/camposCadastro";
import { GrupoRegrasValidacao } from "./GrupoRegrasValidacao";
import { RegraCamposIguais } from "./RegraCamposIguais";
import { RegraCampoObrigatorio } from "./RegraCampoObrigatorio";
import { RegraFormatoCampo } from "./RegraFormatoCampo";
import { RegraTamanhoMinimo } from "./RegraTamanhoMinimo";
import { regrasDadosPessoais } from "./regrasDadosPessoais";
import { regrasEmail } from "./regrasEmail";

// Checagens rápidas antes do envio. As regras definitivas (dígitos do CPF, data no futuro, força da senha,
// e-mail/CPF já cadastrados) são do backend, que devolve a mensagem de cada campo.
// Para validar algo novo, crie uma classe que estenda RegraValidacao e adicione-a aqui.
const regrasCpf = new GrupoRegrasValidacao<CamposCadastro>([
  new RegraCampoObrigatorio("cpf", "Informe seu CPF."),
  new RegraFormatoCampo("cpf", /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF deve ter 11 dígitos."),
]);

const regrasSenha = new GrupoRegrasValidacao<CamposCadastro>([
  new RegraCampoObrigatorio("senha", "Informe uma senha."),
  new RegraTamanhoMinimo("senha", 8, "A senha deve ter pelo menos 8 caracteres."),
  new RegraCampoObrigatorio("confirmacaoSenha", "Confirme sua senha."),
  new RegraCamposIguais("confirmacaoSenha", "senha", "A confirmação não confere com a senha."),
]);

export const regrasCadastroUsuario = new GrupoRegrasValidacao<CamposCadastro>([
  regrasDadosPessoais<CamposCadastro>(),
  regrasCpf,
  regrasEmail<CamposCadastro>(),
  regrasSenha,
]);
