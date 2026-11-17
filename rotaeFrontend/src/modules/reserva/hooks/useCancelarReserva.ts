"use client";

import { useState } from "react";
import { cancelarReserva } from "../services/cancelarReserva";

// Cancela a reserva e informa se o pedido está em andamento ou se deu erro.
// aoFalhar: a recusa pode vir de a reserva ter mudado (ex.: paga em outra aba), então a lista é atualizada.
export function useCancelarReserva(aoCancelar: () => void, aoFalhar?: () => void) {
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
      aoFalhar?.();
    } finally {
      setCancelando(false);
    }
  }

  return { cancelando, erro, cancelar };
}
