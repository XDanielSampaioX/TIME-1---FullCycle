import type { Usuario } from "../types/usuario";
import { IconeUsuario } from "./IconeUsuario";

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
        <IconeUsuario className="size-6" />
      </span>
      <div className="grid min-w-0 gap-0.5">
        <p className="m-0 truncate font-extrabold" title={usuario.nome}>
          {usuario.nome}
        </p>
        <p className="m-0 truncate text-xs text-(--color-text-secondary)" title={usuario.email}>
          {usuario.email}
        </p>
      </div>
    </div>
  );
}
