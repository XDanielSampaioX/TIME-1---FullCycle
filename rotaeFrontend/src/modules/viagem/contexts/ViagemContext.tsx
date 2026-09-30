"use client";

import { createContext, useEffect, useState, type ReactNode } from "react";
import { listarAssentos } from "@/modules/assento/services/listarAssentos";
import { listarCidades } from "@/modules/cidade/services/listarCidades";
import { listarViagensAssentos } from "@/modules/viagem-assento/services/listarViagensAssentos";
import { listarViagens } from "../services/listarViagens";
import type { ViagemContextValue } from "../types/viagemContextValue";

export const ViagemContext = createContext<ViagemContextValue | undefined>(undefined);

export function ViagemProvider({ children }: { children: ReactNode }) {
  const [dados, setDados] = useState<Pick<ViagemContextValue, "viagens" | "cidades" | "assentos" | "assentosViagens">>({
    viagens: [],
    cidades: [],
    assentos: [],
    assentosViagens: [],
  });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let ativo = true;

    Promise.all([listarViagens(), listarCidades(), listarAssentos(), listarViagensAssentos()])
      .then(([viagens, cidades, assentos, assentosViagens]) => {
        if (ativo) {
          setDados({ viagens, cidades, assentos, assentosViagens });
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
  }, [versao]);

  function recarregar() {
    setCarregando(true);
    setErro(null);
    setVersao((valor) => valor + 1);
  }

  return (
    <ViagemContext.Provider value={{ ...dados, carregando, erro, recarregar }}>
      {children}
    </ViagemContext.Provider>
  );
}
