"use client";

import { useEffect, type RefObject } from "react";

// Fecha o <details> com Esc (devolvendo o foco ao botão do menu), ao clicar fora
// e quando o foco sai dele pelo teclado (Tab).
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

    // relatedTarget é o elemento que recebe o foco; sem ele (janela perdeu o foco) o menu continua aberto.
    function aoPerderFoco(evento: FocusEvent) {
      const elemento = menu.current;
      const proximo = evento.relatedTarget as Node | null;
      if (!elemento?.open || !proximo) return;
      if (elemento.contains(evento.target as Node) && !elemento.contains(proximo)) elemento.open = false;
    }

    document.addEventListener("keydown", aoPressionarTecla);
    document.addEventListener("pointerdown", aoClicar);
    document.addEventListener("focusout", aoPerderFoco);

    return () => {
      document.removeEventListener("keydown", aoPressionarTecla);
      document.removeEventListener("pointerdown", aoClicar);
      document.removeEventListener("focusout", aoPerderFoco);
    };
  }, [menu]);
}
