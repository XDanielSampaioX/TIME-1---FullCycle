import type { CadastroUsuario } from "./cadastroUsuario";

// O que a tela de cadastro pede. A confirmação da senha só é conferida aqui: o backend não a recebe.
export type CamposCadastro = CadastroUsuario & { confirmacaoSenha: string };
