import { GrupoRegrasValidacao } from "@/modules/usuario/classes/validacao/GrupoRegrasValidacao";
import { RegraCampoObrigatorio } from "@/modules/usuario/classes/validacao/RegraCampoObrigatorio";
import { RegraFormatoCampo } from "@/modules/usuario/classes/validacao/RegraFormatoCampo";
import type { Credenciais } from "../types/credenciais";

// Checagens rápidas antes do envio. Se o e-mail e a senha conferem, quem decide é o backend.
export const regrasLogin = new GrupoRegrasValidacao<Credenciais>([
  new RegraCampoObrigatorio("email", "Informe seu e-mail."),
  new RegraFormatoCampo("email", /^\S+@\S+\.\S+$/, "Informe um e-mail válido."),
  new RegraCampoObrigatorio("senha", "Informe sua senha."),
]);
