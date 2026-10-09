"use client";

import { type ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSessao } from "@/modules/autenticacao/contexts/SessaoContext";

export function RotaProtegida({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { estadoSessao } = useSessao();

  useEffect(() => {
    if (estadoSessao.status === "nao_autenticado") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [estadoSessao.status, pathname, router]);

  if (estadoSessao.status === "erro") {
    return <main className="usuario-page" role="alert">{estadoSessao.mensagem}</main>;
  }
  if (estadoSessao.status !== "autenticado") {
    return <main className="usuario-page" role="status">Verificando sua sessão...</main>;
  }
  return <>{children}</>;
}
