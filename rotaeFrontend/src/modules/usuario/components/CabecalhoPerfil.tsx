import type { Usuario } from "../types/usuario";
import { AvatarUsuario } from "./AvatarUsuario";

export function CabecalhoPerfil({ usuario }: { usuario: Usuario }) {
  return (
    <div className="flex items-center gap-4">
      <AvatarUsuario className="size-14" />
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
