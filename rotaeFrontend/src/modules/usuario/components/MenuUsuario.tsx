"use client";

import Link from "next/link";
import { useRef } from "react";
import { useFecharMenuSuspenso } from "../hooks/useFecharMenuSuspenso";
import type { EstadoMenuUsuario } from "../types/estadoMenuUsuario";
import type { Usuario } from "../types/usuario";

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

// Mesma ordem do protótipo: Minhas viagens, Editar perfil e, separado, Sair.
const linksAutenticado = [
  { titulo: "Minhas viagens", href: "/reservas" },
  { titulo: "Editar perfil", href: "/editar-perfil" },
];

const classeItem = "block w-full rounded-lg px-3 py-2 text-left no-underline hover:bg-black/5";
const classeBotaoMenu = "flex h-10 items-center gap-2 rounded-full border border-white/25 px-1.5";

function IconeUsuario() {
  return (
    <svg className="size-4 fill-none stroke-current stroke-[1.8]" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5.5 20c.7-3.2 2.8-5 6.5-5s5.8 1.8 6.5 5" />
    </svg>
  );
}

export function MenuUsuario({ estado, usuario, sessaoIndisponivel, aoSair }: MenuUsuarioProps) {
  const menu = useRef<HTMLDetailsElement>(null);
  useFecharMenuSuspenso(menu);

  if (estado === "carregando") {
    return (
      <div className="flex h-16 items-center" role="status" aria-busy="true">
        <span className={`${classeBotaoMenu} w-16 animate-pulse bg-white/10`} aria-hidden="true" />
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
        className={`${classeBotaoMenu} cursor-pointer list-none p-4 [&::-webkit-details-marker]:hidden`}
        aria-label={sessaoIndisponivel ? "Menu da conta (sessão indisponível)" : "Menu da conta"}
      >
        <span className="relative grid size-7 shrink-0 place-items-center rounded-full bg-white/12" aria-hidden="true">
          <IconeUsuario />
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
