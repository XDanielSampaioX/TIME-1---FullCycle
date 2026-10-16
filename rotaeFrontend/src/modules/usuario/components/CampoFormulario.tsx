import type { InputHTMLAttributes } from "react";

type CampoFormularioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "title"> & {
  nome: string;
  titulo: string;
  erro?: string;
};

export function CampoFormulario({ nome, titulo, erro, ...props }: CampoFormularioProps) {
  return (
    <label className="grid gap-1 text-sm font-bold">
      {titulo}
      <input
        className={`
          min-h-11 rounded-(--radius-sm) border border-(--color-border)
          bg-(--color-surface-card) px-3 font-normal
          aria-invalid:border-red-700
        `}
        name={nome}
        aria-invalid={Boolean(erro)}
        aria-describedby={erro ? `erro-${nome}` : undefined}
        {...props}
      />
      {erro && (
        <span className="font-normal text-red-700" id={`erro-${nome}`}>
          {erro}
        </span>
      )}
    </label>
  );
}
