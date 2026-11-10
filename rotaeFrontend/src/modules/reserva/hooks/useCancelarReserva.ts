"use client";

import { useState } from "react";
import { cancelarReserva } from "../services/cancelarReserva";

// Cancela a reserva e informa se o pedido está em andamento ou se deu erro.
export function useCancelarReserva(aoCancelar: () => void) {
  const [cancelando, setCancelando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function cancelar(reservaId: number) {
    setCancelando(true);
    setErro(null);

    try {
      await cancelarReserva(reservaId);
      aoCancelar();
    } catch (motivo) {
      setErro(motivo instanceof Error ? motivo.message : "Não foi possível cancelar a reserva.");
    } finally {
      setCancelando(false);
    }
  }

  return { cancelando, erro, cancelar };
}
