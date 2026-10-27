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
  // O localStorage guarda a sessão, mas não guarda se o servidor respondeu: essa informação só existe
  // em memória e precisa fazer a tela se atualizar quando muda, por isso é um state.
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

  // Uma nova sessão (login) ou o fim dela zera o aviso: ele só vale para a sessão que falhou ao ser confirmada.
  function iniciarSessao(novaSessao: Sessao) {
    setServidorSemResposta(false);
    salvarSessao(novaSessao);
  }

  function sair() {
    setServidorSemResposta(false);
    removerSessao();
  }

  return (
    <AutenticacaoContext.Provider
      value={{
        usuario: sessao?.user ?? null,
        sessaoIndisponivel: sessao !== null && servidorSemResposta,
        iniciarSessao,
        sair,
      }}
    >
      {children}
    </AutenticacaoContext.Provider>
  );
}
