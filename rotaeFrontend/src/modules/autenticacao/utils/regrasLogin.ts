import { GrupoRegrasValidacao } from "@/modules/usuario/classes/validacao/GrupoRegrasValidacao";
import { RegraCampoObrigatorio } from "@/modules/usuario/classes/validacao/RegraCampoObrigatorio";
import { regrasEmail } from "@/modules/usuario/classes/validacao/regrasEmail";
import type { Credenciais } from "../types/credenciais";

// Checagens rápidas antes do envio. Se o e-mail e a senha conferem, quem decide é o backend.
export const regrasLogin = new GrupoRegrasValidacao<Credenciais>([
  regrasEmail<Credenciais>(),
  new RegraCampoObrigatorio("senha", "Informe sua senha."),
]);
