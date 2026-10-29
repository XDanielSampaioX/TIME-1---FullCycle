import type { ReactNode } from "react";

// Círculo do usuário (borda dourada, fundo e ícone). O tamanho vem do className; children é
// para algo sobreposto, como a bolinha de sessão indisponível.
export function AvatarUsuario({ className = "", children }: { className?: string; children?: ReactNode }) {
  return (
    <span
      className={`
        relative grid shrink-0 place-items-center rounded-full border-2
        border-(--color-accent-500) bg-(--color-brand-800) text-white ${className}
      `}
      aria-hidden="true"
    >
      <svg className="size-1/2 fill-none stroke-current stroke-[1.8]" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="3.25" />
        <path d="M5.5 20c.7-3.2 2.8-5 6.5-5s5.8 1.8 6.5 5" />
      </svg>
      {children}
    </span>
  );
}
