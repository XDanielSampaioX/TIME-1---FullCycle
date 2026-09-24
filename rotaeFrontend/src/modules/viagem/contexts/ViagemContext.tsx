"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { listarViagens } from "@/modules/viagem/services/listarViagens";
import type { Viagem } from "@/modules/viagem/types/viagem";

type ViagemContextValue = {
  viagens: Viagem[];
  carregando: boolean;
  erro: string | null;
  recarregar: () => Promise<void>;
};

const ViagemContext = createContext<ViagemContextValue | undefined>(undefined);

export function ViagemProvider({ children }: { children: ReactNode }) {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      setViagens(await listarViagens());
    } catch {
      setErro("Não foi possível carregar as viagens.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  const value = useMemo(
    () => ({ viagens, carregando, erro, recarregar }),
    [viagens, carregando, erro, recarregar],
  );

  return <ViagemContext.Provider value={value}>{children}</ViagemContext.Provider>;
}

export function useViagem() {
  const context = useContext(ViagemContext);
  if (!context) throw new Error("useViagem deve ser usado dentro de ViagemProvider.");
  return context;
}
