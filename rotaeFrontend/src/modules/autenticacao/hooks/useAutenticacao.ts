"use client";

import { useContext } from "react";
import { AutenticacaoContext } from "../contexts/AutenticacaoContext";

export function useAutenticacao() {
  const context = useContext(AutenticacaoContext);

  if (!context) {
    throw new Error("useAutenticacao deve ser usado dentro de AutenticacaoProvider.");
  }

  return context;
}
