"use client";

import { useContext } from "react";
import { ViagemContext } from "../contexts/ViagemContext";

export function useViagem() {
  const context = useContext(ViagemContext);

  if (!context) {
    throw new Error("useViagem deve ser usado dentro de ViagemProvider.");
  }

  return context;
}
