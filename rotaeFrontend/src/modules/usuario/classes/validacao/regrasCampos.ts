import { GrupoRegrasValidacao } from "./GrupoRegrasValidacao";
import { RegraCampoObrigatorio } from "./RegraCampoObrigatorio";
import { RegraCamposIguais } from "./RegraCamposIguais";
import { RegraFormatoCampo } from "./RegraFormatoCampo";
import { RegraTamanhoMinimo } from "./RegraTamanhoMinimo";

// Uma fábrica por campo: a regex e as mensagens de cada campo ficam escritas uma vez só, aqui.
// Os formulários (cadastro, edição de perfil, login, troca de senha) só compõem as fábricas.
// Checagens rápidas antes do envio. As regras definitivas (dígitos do CPF, data no futuro, força da senha,
// e-mail/CPF já cadastrados) são do backend, que devolve a mensagem de cada campo.
type ComCampos<Campo extends string> = Record<string, string> & Record<Campo, string>;

// O par mais comum: o campo precisa estar preenchido e, preenchido, seguir o formato.
function obrigatorioComFormato<Dados extends Record<string, string>>(
  campo: keyof Dados,
  mensagemObrigatorio: string,
  formato: RegExp,
  mensagemFormato: string,
) {
  return new GrupoRegrasValidacao<Dados>([
    new RegraCampoObrigatorio(campo, mensagemObrigatorio),
    new RegraFormatoCampo(campo, formato, mensagemFormato),
  ]);
}

export function regrasNome<Dados extends ComCampos<"nome">>() {
  return new RegraCampoObrigatorio<Dados>("nome", "Informe seu nome.");
}

export function regrasDataNasc<Dados extends ComCampos<"dataNasc">>() {
  return new RegraCampoObrigatorio<Dados>("dataNasc", "Informe sua data de nascimento.");
}

// Os formatos aceitam o valor com ou sem máscara: a máscara só organiza o que a pessoa digita.
export function regrasEmail<Dados extends ComCampos<"email">>() {
  return obrigatorioComFormato<Dados>("email", "Informe seu e-mail.", /^\S+@\S+\.\S+$/, "Informe um e-mail válido.");
}

export function regrasCpf<Dados extends ComCampos<"cpf">>() {
  return obrigatorioComFormato<Dados>("cpf", "Informe seu CPF.", /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF deve ter 11 dígitos.");
}

export function regrasCelular<Dados extends ComCampos<"celular">>() {
  return obrigatorioComFormato<Dados>(
    "celular",
    "Informe seu celular.",
    /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/,
    "Celular deve ter DDD e 10 ou 11 dígitos.",
  );
}

// A senha nova e a sua confirmação. Os nomes dos campos mudam entre o cadastro e a troca de senha.
export function regrasNovaSenha<Dados extends Record<string, string>>(campoSenha: keyof Dados, campoConfirmacao: keyof Dados) {
  return new GrupoRegrasValidacao<Dados>([
    new RegraCampoObrigatorio(campoSenha, "Informe uma senha."),
    new RegraTamanhoMinimo(campoSenha, 8, "A senha deve ter pelo menos 8 caracteres."),
    new RegraCampoObrigatorio(campoConfirmacao, "Confirme sua senha."),
    new RegraCamposIguais(campoConfirmacao, campoSenha, "A confirmação não confere com a senha."),
  ]);
}
