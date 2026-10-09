export const CAMPOS_CADASTRO = [
  "nome", "email", "celular", "dataNasc", "cpf", "senha",
] as const;

export type CampoCadastro = (typeof CAMPOS_CADASTRO)[number];
export type CadastroUsuarioPayload = Record<CampoCadastro, string>;
