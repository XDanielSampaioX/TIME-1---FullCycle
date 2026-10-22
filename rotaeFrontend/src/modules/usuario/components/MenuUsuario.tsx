"use client";

import Link from "next/link";
import { useRef } from "react";
import { useFecharMenuSuspenso } from "../hooks/useFecharMenuSuspenso";
import type { EstadoMenuUsuario } from "../types/estadoMenuUsuario";
import type { Usuario } from "../types/usuario";
import { IconeUsuario } from "./IconeUsuario";

type MenuUsuarioProps = {
  estado: EstadoMenuUsuario;
  usuario: Usuario | null;
  sessaoIndisponivel: boolean;
  aoSair: () => void;
};

const linksAnonimo = [
  { titulo: "Entrar", href: "/login" },
  { titulo: "Criar conta", href: "/cadastro" },
];

// "Minhas viagens" (protótipo) entra aqui quando a tela existir; hoje não há rota para ela.
const linksAutenticado = [{ titulo: "Editar perfil", href: "/editar-perfil" }];

const classeItem = "block w-full rounded-lg px-3 py-2 text-left no-underline hover:bg-black/5";
// Avatar redondo com borda dourada, como no protótipo.
const classeAvatar = "relative grid size-9 shrink-0 place-items-center rounded-full border-2 border-(--color-accent-500) bg-(--color-brand-800) text-white";

export function MenuUsuario({ estado, usuario, sessaoIndisponivel, aoSair }: MenuUsuarioProps) {
  const menu = useRef<HTMLDetailsElement>(null);
  useFecharMenuSuspenso(menu);

  if (estado === "carregando") {
    return (
      <div className="flex h-16 items-center" role="status" aria-busy="true">
        <span className={`${classeAvatar} animate-pulse opacity-60`} aria-hidden="true" />
        <span className="sr-only">Carregando sessão...</span>
      </div>
    );
  }

  const autenticado = estado === "autenticado" && usuario !== null;
  const links = autenticado ? linksAutenticado : linksAnonimo;

  function fechar() {
    if (menu.current) menu.current.open = false;
  }

  return (
    <details className="relative flex h-16 items-center" ref={menu}>
      <summary
        className="flex cursor-pointer list-none items-center gap-1.5 [&::-webkit-details-marker]:hidden"
        aria-label={sessaoIndisponivel ? "Menu da conta (sessão indisponível)" : "Menu da conta"}
      >
        <span className={classeAvatar} aria-hidden="true">
          <IconeUsuario className="size-4" />
          {sessaoIndisponivel && (
            <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full border border-(--color-brand-950) bg-amber-400" />
          )}
        </span>
        <svg className="size-3 shrink-0 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <div
        className={`
          absolute top-[calc(100%+0.6rem)] right-0 z-20 w-max min-w-44
          max-w-[calc(100vw-2rem)] rounded-xl bg-white p-2 text-sm
          text-(--color-brand-950) shadow-xl
        `}
      >
        {sessaoIndisponivel && (
          <p className="m-0 px-3 py-2 text-xs text-amber-800" role="status">
            Não foi possível confirmar sua sessão agora. Algumas ações podem falhar.
          </p>
        )}
        {links.map((link) => (
          <Link className={classeItem} href={link.href} key={link.href} onClick={fechar}>
            {link.titulo}
          </Link>
        ))}
        {autenticado && (
          <>
            <hr className="mx-3 my-1 border-0 border-t border-(--color-border)" />
            <button
              className={`${classeItem} cursor-pointer border-0 bg-transparent text-red-700`}
              type="button"
              onClick={() => {
                fechar();
                aoSair();
              }}
            >
              Sair
            </button>
          </>
        )}
      </div>
    </details>
  );
}
