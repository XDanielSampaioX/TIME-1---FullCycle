"use client";

import { useEffect, useRef } from "react";
import { useExclusaoConta } from "../hooks/useExclusaoConta";

function IconeLixeira() {
  return (
    <svg className="size-4 fill-none stroke-current stroke-[1.8]" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5" />
    </svg>
  );
}

export function AreaSeguranca() {
  const { confirmando, excluindo, erro, pedirConfirmacao, cancelar, confirmar } = useExclusaoConta();
  const botaoExcluir = useRef<HTMLButtonElement>(null);
  const botaoVoltar = useRef<HTMLButtonElement>(null);
  const jaPediuConfirmacao = useRef(false);

  // O foco acompanha a troca de botões: vai para "Voltar" ao abrir a confirmação e volta
  // para "Excluir minha conta" ao cancelar, em vez de se perder junto com o botão que sumiu.
  useEffect(() => {
    if (confirmando) {
      jaPediuConfirmacao.current = true;
      botaoVoltar.current?.focus();
    } else if (jaPediuConfirmacao.current) {
      botaoExcluir.current?.focus();
    }
  }, [confirmando]);

  // Esc cancela a confirmação (exceto enquanto a exclusão está em andamento).
  useEffect(() => {
    if (!confirmando || excluindo) return;

    function aoPressionarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") cancelar();
    }

    document.addEventListener("keydown", aoPressionarTecla);
    return () => document.removeEventListener("keydown", aoPressionarTecla);
  }, [confirmando, excluindo, cancelar]);

  return (
    <section
      aria-labelledby="titulo-area-seguranca"
      className="grid gap-2 rounded-(--radius-md) border border-red-200 bg-red-50 p-4 text-sm"
    >
      <h2 className="m-0 text-sm font-extrabold" id="titulo-area-seguranca">
        Área de segurança
      </h2>
      <p className="m-0 text-xs text-(--color-text-secondary)">
        Sua conta será desativada e você não poderá mais entrar com ela. O registro das viagens já feitas é mantido.
      </p>
      {confirmando ? (
        <div className="grid gap-3" role="group" aria-label="Confirmar exclusão da conta">
          <p className="m-0 font-bold text-red-700">Tem certeza? Sua conta será desativada e você será desconectado.</p>
          <div className="flex flex-wrap gap-3">
            <button
              className="cursor-pointer rounded-(--radius-sm) border-0 bg-red-700 px-3 py-2 font-bold text-white disabled:opacity-60"
              type="button"
              disabled={excluindo}
              onClick={confirmar}
            >
              {excluindo ? "Excluindo..." : "Sim, excluir minha conta"}
            </button>
            <button
              className="cursor-pointer rounded-(--radius-sm) border border-(--color-brand-950) bg-transparent px-3 py-2 font-bold"
              type="button"
              ref={botaoVoltar}
              disabled={excluindo}
              onClick={cancelar}
            >
              Voltar
            </button>
          </div>
        </div>
      ) : (
        <button
          className="inline-flex w-fit cursor-pointer items-center gap-2 border-0 bg-transparent p-0 font-bold text-red-700 underline"
          type="button"
          ref={botaoExcluir}
          onClick={pedirConfirmacao}
        >
          <IconeLixeira />
          Excluir minha conta
        </button>
      )}
      {erro && (
        <p className="m-0 text-red-700" role="alert">
          {erro}
        </p>
      )}
    </section>
  );
}
