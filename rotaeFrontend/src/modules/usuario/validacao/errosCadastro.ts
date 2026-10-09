import type { CampoCadastro } from "@/modules/usuario/types/cadastroUsuarioPayload";

export type ErrosCadastro = Partial<Record<CampoCadastro, string>>;
