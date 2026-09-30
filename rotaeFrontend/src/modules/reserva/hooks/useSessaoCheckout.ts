"use client";

import { useMemo, useSyncExternalStore } from "react";
import { interpretarSessaoCheckout } from "../types/sessaoCheckout";
import { obterSessaoCheckoutSerializada, observarSessaoCheckout, salvarSessaoCheckout } from "../services/sessaoCheckoutStorage";
import type { SessaoCheckout } from "../types/sessaoCheckout";

export function useSessaoCheckout(viagemId: number) {
  const serializada = useSyncExternalStore(
    observarSessaoCheckout,
    obterSessaoCheckoutSerializada,
    () => undefined,
  );
  const atual = useMemo(() => interpretarSessaoCheckout(serializada ?? null), [serializada]);
  const sessao = atual?.viagemId === viagemId ? atual : null;

  function atualizar(proxima: SessaoCheckout) {
    salvarSessaoCheckout(proxima);
  }

  return { sessao, carregando: serializada === undefined, atualizar };
}
