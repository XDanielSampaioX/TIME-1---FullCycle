import type { AlteracaoSenha } from "../../types/alteracaoSenha";
import { GrupoRegrasValidacao } from "./GrupoRegrasValidacao";
import { RegraCampoObrigatorio } from "./RegraCampoObrigatorio";
import { regrasNovaSenha } from "./regrasCampos";

// A troca de senha. Se a senha atual está correta, quem decide é o backend.
export const regrasAlteracaoSenha = new GrupoRegrasValidacao<AlteracaoSenha>([
  new RegraCampoObrigatorio("senhaAtual", "Informe sua senha atual."),
  regrasNovaSenha("novaSenha", "confirmacaoNovaSenha"),
]);
