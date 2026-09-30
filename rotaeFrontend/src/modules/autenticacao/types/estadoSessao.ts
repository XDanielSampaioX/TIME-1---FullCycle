import type { Usuario } from "@/modules/usuario/types/usuario";

export type EstadoSessao =
  | { status: "carregando" }
  | { status: "nao_autenticado" }
  | { status: "autenticado"; usuario: Usuario }
  | { status: "erro"; mensagem: string };