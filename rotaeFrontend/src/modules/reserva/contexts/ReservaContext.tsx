"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { cancelarReserva } from "@/modules/reserva/services/cancelarReserva";
import { listarReservas } from "@/modules/reserva/services/listarReservas";
import type { Reserva } from "@/modules/reserva/types/reserva";

type ReservaContextValue = {
  reservas: Reserva[];
  carregando: boolean;
  erro: string | null;
  recarregar: () => Promise<void>;
  cancelar: (id: number) => Promise<void>;
};

const ReservaContext = createContext<ReservaContextValue | undefined>(undefined);

export function ReservaProvider({ children }: { children: ReactNode }) {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      setReservas(await listarReservas());
    } catch {
      setErro("Não foi possível carregar as reservas.");
    } finally {
      setCarregando(false);
    }
  }, []);

  const cancelar = useCallback(async (id: number) => {
    await cancelarReserva(id);
    await recarregar();
  }, [recarregar]);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  const value = useMemo(
    () => ({ reservas, carregando, erro, recarregar, cancelar }),
    [reservas, carregando, erro, recarregar, cancelar],
  );

  return <ReservaContext.Provider value={value}>{children}</ReservaContext.Provider>;
}

export function useReserva() {
  const context = useContext(ReservaContext);
  if (!context) throw new Error("useReserva deve ser usado dentro de ReservaProvider.");
  return context;
}
