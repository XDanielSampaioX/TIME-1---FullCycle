"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";

type CampoFormularioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "title"> & {
  nome: string;
  titulo: string;
  erro?: string;
  ajuda?: string;
  icone?: ReactNode;
};

export function CampoFormulario({ nome, titulo, erro, ajuda, icone, ...props }: CampoFormularioProps) {
  // useId garante ids únicos mesmo que outro campo da página tenha o mesmo nome.
  const id = useId();
  const idErro = `${id}-erro`;
  const idAjuda = `${id}-ajuda`;
  const descricao = [erro && idErro, ajuda && idAjuda].filter(Boolean).join(" ") || undefined;

  // O erro e a ajuda ficam fora do <label>: assim o nome acessível do campo é só o título.
  return (
    <div className="grid gap-1.5 text-sm text-(--color-text-secondary)">
      <label className="grid gap-1.5">
        <span className="text-[0.7rem] font-extrabold tracking-wide uppercase">{titulo}</span>
        <span className="relative block">
          <input
            className={`
              min-h-11 w-full rounded-(--radius-sm) border border-transparent
              bg-(--color-surface-subtle) px-3 text-(--color-text-primary)
              placeholder:text-(--color-text-muted)
              disabled:text-(--color-text-muted) aria-invalid:border-red-700
              ${icone ? "pr-10" : ""}
            `}
            name={nome}
            aria-invalid={Boolean(erro)}
            aria-describedby={descricao}
            {...props}
          />
          {icone && (
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-(--color-text-muted)" aria-hidden="true">
              {icone}
            </span>
          )}
        </span>
      </label>
      {ajuda && (
        <span className="text-xs" id={idAjuda}>
          {ajuda}
        </span>
      )}
      {erro && (
        <span className="text-xs text-red-700" id={idErro}>
          {erro}
        </span>
      )}
    </div>
  );
}
