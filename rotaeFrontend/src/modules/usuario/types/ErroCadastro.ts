import type { CampoCadastro } from "./cadastroUsuarioPayload";

export class ErroCadastro extends Error {
  constructor(
    public readonly campos: Partial<Record<CampoCadastro, string>>,
  ) {
    super("Confira os dados do cadastro.");
    this.name = "ErroCadastro";
  }
}
