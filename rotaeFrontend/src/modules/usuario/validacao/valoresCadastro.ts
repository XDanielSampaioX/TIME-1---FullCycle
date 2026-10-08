import type { CadastroUsuarioPayload } from "@/modules/usuario/types/cadastroUsuarioPayload";

// No formulário, mesmo os campos opcionais começam como textos vazios.
export type ValoresCadastro = Required<CadastroUsuarioPayload>;
