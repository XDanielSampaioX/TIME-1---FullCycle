import type { CamposCadastro } from "../../types/camposCadastro";
import { GrupoRegrasValidacao } from "./GrupoRegrasValidacao";
import { regrasCelular, regrasCpf, regrasDataNasc, regrasEmail, regrasNome, regrasNovaSenha } from "./regrasCampos";

// O formulário de cadastro, montado com as regras de cada campo (regrasCampos.ts).
export const regrasCadastroUsuario = new GrupoRegrasValidacao<CamposCadastro>([
  regrasNome(),
  regrasDataNasc(),
  regrasCelular(),
  regrasCpf(),
  regrasEmail(),
  regrasNovaSenha("senha", "confirmacaoSenha"),
]);
