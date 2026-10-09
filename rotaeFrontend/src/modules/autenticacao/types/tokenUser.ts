import type { Usuario } from "@/modules/usuario/types/usuario";

export type TokensSessao = {
  access: string;
  refresh: string;
};

// Contrato da resposta do backend; os tokens ficam só nas rotas do servidor Next.
export type TokenUser = TokensSessao & {
  user: Usuario;
};
