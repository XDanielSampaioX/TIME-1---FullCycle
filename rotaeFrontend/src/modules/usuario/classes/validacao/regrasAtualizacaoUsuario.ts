import type { AtualizacaoUsuario } from "../../types/atualizacaoUsuario";
import { GrupoRegrasValidacao } from "./GrupoRegrasValidacao";
import { RegraCampoObrigatorio } from "./RegraCampoObrigatorio";
import { RegraFormatoCampo } from "./RegraFormatoCampo";

// Checagens rápidas antes do envio. As regras definitivas (e-mail já usado, data futura)
// são do backend, que devolve a mensagem de cada campo.
// Para validar algo novo, crie uma classe que estenda RegraValidacao e adicione-a aqui.
const regrasDadosPessoais = new GrupoRegrasValidacao<AtualizacaoUsuario>([
  new RegraCampoObrigatorio("nome", "Informe seu nome."),
  new RegraCampoObrigatorio("dataNasc", "Informe sua data de nascimento."),
  new RegraCampoObrigatorio("celular", "Informe seu celular."),
  new RegraFormatoCampo("celular", /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, "Celular deve ter DDD e 10 ou 11 dígitos."),
]);

const regrasDadosAcesso = new GrupoRegrasValidacao<AtualizacaoUsuario>([
  new RegraCampoObrigatorio("email", "Informe seu e-mail."),
  new RegraFormatoCampo("email", /^\S+@\S+\.\S+$/, "Informe um e-mail válido."),
]);

export const regrasAtualizacaoUsuario = new GrupoRegrasValidacao<AtualizacaoUsuario>([
  regrasDadosPessoais,
  regrasDadosAcesso,
]);
