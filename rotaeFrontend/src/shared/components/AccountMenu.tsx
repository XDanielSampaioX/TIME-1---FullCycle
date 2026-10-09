"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSessao } from "@/modules/autenticacao/contexts/SessaoContext";

export function AccountMenu() {
  const router = useRouter();
  const { estadoSessao, sair } = useSessao();
  const [erro, setErro] = useState<string | null>(null);
  const autenticado = estadoSessao.status === "autenticado";

  async function encerrar() {
    setErro(null);
    try {
      await sair();
      router.replace("/login");
      router.refresh();
    } catch (causa) {
      setErro(causa instanceof Error ? causa.message : "Não foi possível sair.");
    }
  }

  return (
    <details className="relative h-16 flex items-center">
      <summary className="flex h-10 p-4 cursor-pointer list-none items-center gap-2 rounded-full border border-white/25 px-1.5 [&::-webkit-details-marker]:hidden" aria-label="Menu da conta">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/12" aria-hidden="true">
          <svg className="size-4 fill-none stroke-current stroke-[1.8]" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="3.25" />
            <path d="M5.5 20c.7-3.2 2.8-5 6.5-5s5.8 1.8 6.5 5" />
          </svg>
        </span>
        <svg className="size-3 shrink-0 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <div className="absolute right-0 top-[calc(100%+0.6rem)] z-20 min-w-44 rounded-xl bg-white p-2 text-sm text-(--color-brand-950) shadow-xl">
        {autenticado ? (
          <>
            <Link className="block rounded-lg px-3 py-2 hover:bg-black/5" href="/minha-conta">Minha conta</Link>
            <button type="button" className="block w-full rounded-lg px-3 py-2 text-left hover:bg-black/5" onClick={encerrar}>Sair</button>
          </>
        ) : (
          <>
            <Link className="block rounded-lg px-3 py-2 hover:bg-black/5" href="/login">Entrar</Link>
            <Link className="block rounded-lg px-3 py-2 hover:bg-black/5" href="/cadastro">Criar conta</Link>
          </>
        )}
        {erro && <p role="alert" className="px-3 text-red-700">{erro}</p>}
      </div>
    </details>
  );
}
