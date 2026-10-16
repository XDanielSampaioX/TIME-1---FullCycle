"use client";

import { useEffect, type RefObject } from "react";

// Quando os erros mudam, leva o foco ao primeiro campo marcado como inválido.
export function useFocoPrimeiroErro(formulario: RefObject<HTMLFormElement | null>, erros: object) {
  useEffect(() => {
    formulario.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus();
  }, [formulario, erros]);
}
