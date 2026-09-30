"use client";

import { useContext } from "react";

import { ReservaContext } from "@/modules/reserva/contexts/ReservaContext";

export function useReserva() {
  const context = useContext(ReservaContext);

  if (!context) {
    throw new Error(
      "useReserva deve ser usado dentro de ReservaProvider.",
    );
  }

  return context;
}
