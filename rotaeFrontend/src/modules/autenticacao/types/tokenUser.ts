import type { Usuario } from "@/modules/usuario/types/usuario";

// Formato esperado da resposta de login do backend.
export type TokenUser = {
  access: string;
  refresh: string;
  user: Usuario;
};
