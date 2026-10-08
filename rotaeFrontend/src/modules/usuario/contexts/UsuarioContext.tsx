"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useSessao } from "@/modules/autenticacao/contexts/SessaoContext";
import { atualizarUsuario } from "@/modules/usuario/services/atualizarUsuario";
import { criarUsuario } from "@/modules/usuario/services/criarUsuario";
import { inativarUsuario } from "@/modules/usuario/services/inativarUsuario";
import type { AtualizacaoUsuarioPayload } from "@/modules/usuario/types/atualizacaoUsuarioPayload";
import type { CadastroUsuarioPayload } from "@/modules/usuario/types/cadastroUsuarioPayload";
import type { Usuario } from "@/modules/usuario/types/usuario";

type UsuarioContextValue = {
  carregando: boolean;
  erro: string | null;
  cadastrar: (dados: CadastroUsuarioPayload) => Promise<void>;
  editar: (
    dados: AtualizacaoUsuarioPayload,
    accessToken: string,
  ) => Promise<Usuario>;
  inativar: (accessToken: string) => Promise<void>;
};

const UsuarioContext = createContext<UsuarioContextValue | undefined>(undefined);

function mensagemDoErro(causa: unknown, mensagemPadrao: string): string {
  if (causa instanceof Error && causa.message.trim()) {
    return causa.message;
  }

  return mensagemPadrao;
}

export function UsuarioProvider({ children }: { children: ReactNode }) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const { atualizarUsuarioDaSessao, invalidar } = useSessao();

  const cadastrar = useCallback(async (dados: CadastroUsuarioPayload) => {
    setCarregando(true);
    setErro(null);

    try {
      await criarUsuario(dados);
    } catch (causa) {
      setErro(mensagemDoErro(causa, "Não foi possível realizar o cadastro."));
      throw causa;
    } finally {
      setCarregando(false);
    }
  }, []);

  const editar = useCallback(
    async (
      dados: AtualizacaoUsuarioPayload,
      accessToken: string,
    ): Promise<Usuario> => {
      setCarregando(true);
      setErro(null);

      try {
        const usuarioAtualizado = await atualizarUsuario(dados, accessToken);
        atualizarUsuarioDaSessao(usuarioAtualizado);
        return usuarioAtualizado;
      } catch (causa) {
        setErro(mensagemDoErro(causa, "Não foi possível atualizar o usuário."));
        throw causa;
      } finally {
        setCarregando(false);
      }
    },
    [atualizarUsuarioDaSessao],
  );

  const inativar = useCallback(
    async (accessToken: string): Promise<void> => {
      setCarregando(true);
      setErro(null);

      try {
        await inativarUsuario(accessToken);
        invalidar();
      } catch (causa) {
        setErro(mensagemDoErro(causa, "Não foi possível desativar sua conta."));
        throw causa;
      } finally {
        setCarregando(false);
      }
    },
    [invalidar],
  );

  const value = useMemo(
    () => ({ carregando, erro, cadastrar, editar, inativar }),
    [carregando, erro, cadastrar, editar, inativar],
  );

  return (
    <UsuarioContext.Provider value={value}>
      {children}
    </UsuarioContext.Provider>
  );
}

export function useUsuario() {
  const context = useContext(UsuarioContext);

  if (!context) {
    throw new Error("useUsuario deve ser usado dentro de UsuarioProvider.");
  }

  return context;
}