import type { InputHTMLAttributes, ReactNode } from "react";

type CampoFormularioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "title"> & {
  nome: string;
  titulo: string;
  erro?: string;
  icone?: ReactNode;
};

export function CampoFormulario({ nome, titulo, erro, icone, ...props }: CampoFormularioProps) {
  return (
    <label className="grid gap-1.5 text-sm text-(--color-text-secondary)">
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
          aria-describedby={erro ? `erro-${nome}` : undefined}
          {...props}
        />
        {icone && (
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-(--color-text-muted)" aria-hidden="true">
            {icone}
          </span>
        )}
      </span>
      {erro && (
        <span className="text-xs text-red-700" id={`erro-${nome}`}>
          {erro}
        </span>
      )}
    </label>
  );
}
