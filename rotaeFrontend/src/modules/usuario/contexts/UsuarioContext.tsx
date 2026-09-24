"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { criarUsuario } from "@/modules/usuario/services/criarUsuario";
import type { Usuario } from "@/modules/usuario/types/usuario";

type UsuarioContextValue = {
  usuario: Usuario | null;
  carregando: boolean;
  erro: string | null;
  cadastrar: (dados: Usuario) => Promise<void>;
};

const UsuarioContext = createContext<UsuarioContextValue | undefined>(undefined);

export function UsuarioProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const cadastrar = useCallback(async (dados: Usuario) => {
    setCarregando(true);
    setErro(null);

    try {
      setUsuario(await criarUsuario(dados));
    } catch {
      setErro("Não foi possível realizar o cadastro.");
      throw new Error("Falha no cadastro do usuário.");
    } finally {
      setCarregando(false);
    }
  }, []);

  const value = useMemo(
    () => ({ usuario, carregando, erro, cadastrar }),
    [usuario, carregando, erro, cadastrar],
  );

  return <UsuarioContext.Provider value={value}>{children}</UsuarioContext.Provider>;
}

export function useUsuario() {
  const context = useContext(UsuarioContext);
  if (!context) throw new Error("useUsuario deve ser usado dentro de UsuarioProvider.");
  return context;
}
