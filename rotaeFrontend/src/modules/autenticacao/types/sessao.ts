import type { Usuario } from "@/modules/usuario/types/usuario";

export type Tokens = {
  access: string;
  refresh: string;
};

export type Sessao = Tokens & {
  user: Usuario;
};
