"use client";

import { useEffect, type RefObject } from "react";

// Quando o gatilho muda, leva o foco ao primeiro campo marcado como inválido.
// O gatilho deve mudar só no envio (ex.: os erros do envio ou um contador de tentativas),
// nunca a cada tecla, senão o foco sai do campo em que a pessoa está digitando.
export function useFocoPrimeiroErro(formulario: RefObject<HTMLFormElement | null>, gatilho: unknown) {
  useEffect(() => {
    formulario.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus();
  }, [formulario, gatilho]);
}
