import type { Usuario } from "@/modules/usuario/types/usuario";
import type { EstadoSessao } from "./estadoSessao";
import type { Sessao } from "./sessao";

export type AutenticacaoContextValue = {
  usuario: Usuario | null;
  estado: EstadoSessao;
  // Há sessão salva, mas o servidor não respondeu para confirmá-la (ex.: sem rede).
  sessaoIndisponivel: boolean;
  // Login: começa uma sessão nova.
  iniciarSessao: (sessao: Sessao) => void;
  // Troca só parte da sessão já existente (tokens e/ou usuário).
  atualizarSessao: (parcial: Partial<Sessao>) => void;
  sair: () => void;
};
