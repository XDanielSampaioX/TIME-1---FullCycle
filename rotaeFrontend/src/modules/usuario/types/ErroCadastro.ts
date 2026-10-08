import type { CadastroUsuarioPayload } from "./cadastroUsuarioPayload";

export class ErroCadastro extends Error {
  constructor(
    public readonly campos: Partial<
      Record<keyof CadastroUsuarioPayload, string>
    >,
  ) {
    super("Confira os dados do cadastro.");
    this.name = "ErroCadastro";
  }
}