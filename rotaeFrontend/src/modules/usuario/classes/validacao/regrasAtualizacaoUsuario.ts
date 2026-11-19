import type { AtualizacaoUsuario } from "../../types/atualizacaoUsuario";
import { GrupoRegrasValidacao } from "./GrupoRegrasValidacao";
import { regrasCelular, regrasDataNasc, regrasEmail, regrasNome } from "./regrasCampos";

// A edição dos dados do perfil, montada com as regras de cada campo (regrasCampos.ts).
export const regrasAtualizacaoUsuario = new GrupoRegrasValidacao<AtualizacaoUsuario>([
  regrasNome(),
  regrasDataNasc(),
  regrasCelular(),
  regrasEmail(),
]);
