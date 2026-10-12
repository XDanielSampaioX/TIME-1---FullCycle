import type { Usuario } from "@/modules/usuario/types/usuario";
import type { Sessao } from "./sessao";

export type AutenticacaoContextValue = {
  usuario: Usuario | null;
  iniciarSessao: (sessao: Sessao) => void;
  sair: () => void;
};
