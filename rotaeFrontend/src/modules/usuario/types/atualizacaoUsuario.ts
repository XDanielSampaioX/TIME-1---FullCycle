import type { CadastroUsuario } from "./cadastroUsuario";

// PATCH /me/: só dados cadastrais. CPF e senha ficam de fora.
export type AtualizacaoUsuario = Pick<CadastroUsuario, "nome" | "email" | "celular" | "dataNasc">;
