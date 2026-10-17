"use client";

import { useEffect, type RefObject } from "react";

// Fecha o <details> com Esc (devolvendo o foco ao botão do menu) e ao clicar fora dele.
export function useFecharMenuSuspenso(menu: RefObject<HTMLDetailsElement | null>) {
  useEffect(() => {
    function aoPressionarTecla(evento: KeyboardEvent) {
      const elemento = menu.current;
      if (evento.key !== "Escape" || !elemento?.open) return;

      elemento.open = false;
      elemento.querySelector("summary")?.focus();
    }

    function aoClicar(evento: PointerEvent) {
      const elemento = menu.current;
      if (elemento?.open && !elemento.contains(evento.target as Node)) elemento.open = false;
    }

    document.addEventListener("keydown", aoPressionarTecla);
    document.addEventListener("pointerdown", aoClicar);

    return () => {
      document.removeEventListener("keydown", aoPressionarTecla);
      document.removeEventListener("pointerdown", aoClicar);
    };
  }, [menu]);
}
