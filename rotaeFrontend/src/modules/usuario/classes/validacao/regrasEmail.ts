import { GrupoRegrasValidacao } from "./GrupoRegrasValidacao";
import { RegraCampoObrigatorio } from "./RegraCampoObrigatorio";
import { RegraFormatoCampo } from "./RegraFormatoCampo";

// Composite: as mesmas regras de e-mail para qualquer formulário que tenha o campo "email"
// (login, cadastro e edição de perfil), num lugar só.
export function regrasEmail<Dados extends Record<string, string> & { email: string }>() {
  return new GrupoRegrasValidacao<Dados>([
    new RegraCampoObrigatorio<Dados>("email", "Informe seu e-mail."),
    new RegraFormatoCampo<Dados>("email", /^\S+@\S+\.\S+$/, "Informe um e-mail válido."),
  ]);
}
