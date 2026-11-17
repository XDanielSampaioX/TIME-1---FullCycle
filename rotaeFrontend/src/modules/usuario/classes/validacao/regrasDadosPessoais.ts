import { GrupoRegrasValidacao } from "./GrupoRegrasValidacao";
import { RegraCampoObrigatorio } from "./RegraCampoObrigatorio";
import { RegraFormatoCampo } from "./RegraFormatoCampo";

type DadosPessoais = Record<string, string> & { nome: string; dataNasc: string; celular: string };

// Composite: as mesmas regras de nome, data de nascimento e celular para o cadastro e a edição de perfil.
export function regrasDadosPessoais<Dados extends DadosPessoais>() {
  return new GrupoRegrasValidacao<Dados>([
    new RegraCampoObrigatorio<Dados>("nome", "Informe seu nome."),
    new RegraCampoObrigatorio<Dados>("dataNasc", "Informe sua data de nascimento."),
    new RegraCampoObrigatorio<Dados>("celular", "Informe seu celular."),
    new RegraFormatoCampo<Dados>("celular", /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, "Celular deve ter DDD e 10 ou 11 dígitos."),
  ]);
}
