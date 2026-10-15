import type { AlteracaoSenha } from "../../types/alteracaoSenha";
import { GrupoRegrasValidacao } from "./GrupoRegrasValidacao";
import { RegraCampoObrigatorio } from "./RegraCampoObrigatorio";
import { RegraCamposIguais } from "./RegraCamposIguais";
import { RegraTamanhoMinimo } from "./RegraTamanhoMinimo";

// Checagens rápidas antes do envio. A senha atual correta e a força da nova senha são do backend.
const regrasNovaSenha = new GrupoRegrasValidacao<AlteracaoSenha>([
  new RegraCampoObrigatorio("novaSenha", "Informe a nova senha."),
  new RegraTamanhoMinimo("novaSenha", 8, "A senha deve ter pelo menos 8 caracteres."),
  new RegraCampoObrigatorio("confirmacaoNovaSenha", "Confirme a nova senha."),
  new RegraCamposIguais("confirmacaoNovaSenha", "novaSenha", "A confirmação não confere com a nova senha."),
]);

export const regrasAlteracaoSenha = new GrupoRegrasValidacao<AlteracaoSenha>([
  new RegraCampoObrigatorio("senhaAtual", "Informe sua senha atual."),
  regrasNovaSenha,
]);
