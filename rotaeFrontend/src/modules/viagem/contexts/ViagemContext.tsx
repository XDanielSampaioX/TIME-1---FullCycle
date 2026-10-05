"use client";

import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { listarCidades } from "@/modules/cidade/services/listarCidades";
import { listarViagens } from "../services/listarViagens";
import type { ViagemContextValue } from "../types/viagemContextValue";

export const ViagemContext = createContext<ViagemContextValue | undefined>(undefined);

export function ViagemProvider({ children, carregarViagensInicialmente = true }: {
  children: ReactNode;
  carregarViagensInicialmente?: boolean;
}) {
  const [paginaViagens, setPaginaViagens] = useState<ViagemContextValue["paginaViagens"]>(null);
  const [cidades, setCidades] = useState<ViagemContextValue["cidades"]>([]);
  const [urlPagina, setUrlPagina] = useState<string | null>(carregarViagensInicialmente ? "/api/v1/viagens/" : null);
  const urlPaginaAtual = useRef(urlPagina);
  const [cidadesCarregadas, setCidadesCarregadas] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let ativo = true;

    if (!urlPagina) return;

    listarViagens(urlPagina)
      .then((pagina) => {
        if (ativo) {
          setPaginaViagens(pagina);
          setErro(null);
        }
      })
      .catch(() => {
        if (ativo) {
          setErro("Não foi possível carregar as viagens. Tente novamente.");
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [urlPagina, versao]);

  useEffect(() => {
    let ativo = true;

    listarCidades(versao > 0)
      .then((resultado) => {
        if (ativo) setCidades(resultado);
        if (ativo) setCidadesCarregadas(true);
      })
      .catch(() => {
        if (ativo) setErro("Não foi possível carregar as viagens. Tente novamente.");
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [versao]);

  function recarregar() {
    setCarregando(true);
    setErro(null);
    setVersao((valor) => valor + 1);
  }

  function navegarPaginaViagens(url: string) {
    urlPaginaAtual.current = url;
    setCarregando(true);
    setErro(null);
    setUrlPagina(url);
  }

  const consultarViagens = useCallback((parametros: URLSearchParams) => {
    const query = parametros.toString();
    const url = `/api/v1/viagens/${query ? `?${query}` : ""}`;
    if (urlPaginaAtual.current === url) return;
    urlPaginaAtual.current = url;
    setCarregando(true);
    setErro(null);
    setUrlPagina(url);
  }, []);

  return (
    <ViagemContext.Provider value={{
      viagens: paginaViagens?.results ?? [],
      paginaViagens,
      cidades,
      cidadesCarregadas,
      carregando,
      erro,
      recarregar,
      navegarPaginaViagens,
      consultarViagens,
    }}>
      {children}
    </ViagemContext.Provider>
  );
}
