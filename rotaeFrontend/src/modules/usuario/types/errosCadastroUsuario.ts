import type { CadastroUsuario } from "./cadastroUsuario";

// Uma mensagem por campo com problema; objeto vazio significa cadastro válido.
export type ErrosCadastroUsuario = Partial<Record<keyof CadastroUsuario, string>>;
