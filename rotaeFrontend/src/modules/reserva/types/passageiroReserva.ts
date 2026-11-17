import type { Usuario } from "@/modules/usuario/types/usuario";

export type PassageiroReserva = Usuario & {
  usuarioId: number | null;
};
