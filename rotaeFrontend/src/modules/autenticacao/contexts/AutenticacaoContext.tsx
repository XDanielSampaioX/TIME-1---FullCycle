"use client";

import { createContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { buscarUsuarioAutenticado } from "../services/buscarUsuarioAutenticado";
import type { AutenticacaoContextValue } from "../types/autenticacaoContextValue";
import type { Sessao } from "../types/sessao";
import { acompanharSessao, lerSessao, lerSessaoSalva, removerSessao, salvarSessao } from "../utils/sessaoSalva";

export const AutenticacaoContext = createContext<AutenticacaoContextValue | undefined>(undefined);

export function AutenticacaoProvider({ children }: { children: ReactNode }) {
  const sessaoSalva = useSyncExternalStore(acompanharSessao, lerSessaoSalva, () => null);
  const sessao = sessaoSalva ? JSON.parse(sessaoSalva) as Sessao : null;
  const [servidorSemResposta, setServidorSemResposta] = useState(false);

  // Ao abrir ou recarregar a página, confirma no backend (/me/) se a sessão salva ainda vale.
  useEffect(() => {
    if (!lerSessao()) return;

    buscarUsuarioAutenticado()
      .then((usuario) => {
        const sessaoAtual = lerSessao();

        if (!usuario) removerSessao();
        else if (sessaoAtual) salvarSessao({ ...sessaoAtual, user: usuario });
      })
      .catch(() => {
        // Sem resposta do servidor não dá para saber se a sessão é válida; ela é mantida
        // e os componentes são avisados por sessaoIndisponivel.
        setServidorSemResposta(true);
      });
  }, []);

  return (
    <AutenticacaoContext.Provider
      value={{
        usuario: sessao?.user ?? null,
        sessaoIndisponivel: sessao !== null && servidorSemResposta,
        iniciarSessao: salvarSessao,
        sair: removerSessao,
      }}
    >
      {children}
    </AutenticacaoContext.Provider>
  );
}
