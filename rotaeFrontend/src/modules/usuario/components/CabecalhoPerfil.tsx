import type { Usuario } from "../types/usuario";

export function CabecalhoPerfil({ usuario }: { usuario: Usuario }) {
  return (
    <div className="flex items-center gap-4">
      <span
        className={`
          grid size-14 shrink-0 place-items-center rounded-full border-2
          border-(--color-accent-500) bg-(--color-brand-800) text-white
        `}
        aria-hidden="true"
      >
        <svg className="size-6 fill-none stroke-current stroke-[1.8]" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="3.25" />
          <path d="M5.5 20c.7-3.2 2.8-5 6.5-5s5.8 1.8 6.5 5" />
        </svg>
      </span>
      <div className="grid min-w-0 gap-0.5">
        <p className="m-0 truncate font-extrabold">{usuario.nome}</p>
        <p className="m-0 truncate text-xs text-(--color-text-secondary)">{usuario.email}</p>
      </div>
    </div>
  );
}
