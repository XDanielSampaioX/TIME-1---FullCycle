"use client";

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { criarUsuario } from "@/modules/usuario/services/criarUsuario";
import type { CadastroUsuarioPayload } from "@/modules/usuario/types/cadastroUsuarioPayload";

type UsuarioContextValue = {
  carregando: boolean;
  erro: string | null;
  cadastrar: (dados: CadastroUsuarioPayload) => Promise<void>;
};

const UsuarioContext = createContext<UsuarioContextValue | undefined>(undefined);

export function UsuarioProvider({ children }: { children: ReactNode }) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const cadastrar = useCallback(async (dados: CadastroUsuarioPayload) => {
    setCarregando(true);
    setErro(null);
    try {
      await criarUsuario(dados);
    } catch (causa) {
      setErro(causa instanceof Error ? causa.message : "Não foi possível realizar o cadastro.");
      throw causa;
    } finally {
      setCarregando(false);
    }
  }, []);

  const value = useMemo(() => ({ carregando, erro, cadastrar }), [carregando, erro, cadastrar]);

  return <UsuarioContext.Provider value={value}>{children}</UsuarioContext.Provider>;
}

export function useUsuario() {
  const context = useContext(UsuarioContext);
  if (!context) throw new Error("useUsuario deve ser usado dentro de UsuarioProvider.");
  return context;
}
