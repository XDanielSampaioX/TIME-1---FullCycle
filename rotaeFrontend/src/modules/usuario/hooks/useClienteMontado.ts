"use client";

import { useSyncExternalStore } from "react";

const semAssinatura = () => () => {};

// false no servidor e na primeira renderização do navegador; true depois.
// Evita mostrar "faça login" por um instante a quem já está logado.
export function useClienteMontado() {
  return useSyncExternalStore(semAssinatura, () => true, () => false);
}
