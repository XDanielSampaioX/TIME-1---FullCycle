import type { Usuario } from "@/modules/usuario/types/usuario";
import type { Sessao } from "./sessao";

export type AutenticacaoContextValue = {
  usuario: Usuario | null;
  // Há sessão salva, mas o servidor não respondeu para confirmá-la (ex.: sem rede).
  sessaoIndisponivel: boolean;
  iniciarSessao: (sessao: Sessao) => void;
  sair: () => void;
};
