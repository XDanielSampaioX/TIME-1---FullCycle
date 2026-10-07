"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { atualizarUsuario } from "@/modules/usuario/services/atualizarUsuario";
import { buscarUsuario } from "@/modules/usuario/services/buscarUsuario";
import { criarUsuario } from "@/modules/usuario/services/criarUsuario";
import { listarUsuarios } from "@/modules/usuario/services/listarUsuarios";
import { removerUsuario } from "@/modules/usuario/services/removerUsuario";
import type { AtualizacaoUsuarioPayload } from "@/modules/usuario/types/atualizacaoUsuarioPayload";
import type { CadastroUsuarioPayload } from "@/modules/usuario/types/cadastroUsuarioPayload";
import type { Usuario } from "@/modules/usuario/types/usuario";

type UsuarioContextValue = {
  usuarios: Usuario[];
  carregando: boolean;
  erro: string | null;
  cadastrar: (dados: CadastroUsuarioPayload) => Promise<void>;
  listar: () => Promise<Usuario[]>;
  buscar: (id: number) => Promise<Usuario>;
  editar: (id: number, dados: AtualizacaoUsuarioPayload) => Promise<Usuario>;
  remover: (id: number) => Promise<void>;
};

const UsuarioContext = createContext<UsuarioContextValue | undefined>(undefined);
function mensagemDoErro(causa: unknown, mensagemPadrao: string): string {
  if (causa instanceof Error && causa.message.trim()) {
    return causa.message;
  }

  return mensagemPadrao;
}

export function UsuarioProvider({ children }: { children: ReactNode }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const cadastrar = useCallback(async (dados: CadastroUsuarioPayload) => {
    setCarregando(true);
    setErro(null);

    try {
      const novoUsuario = await criarUsuario(dados);
      setUsuarios((anteriores) => [...anteriores, novoUsuario]);
    } catch (causa) {
      setErro(mensagemDoErro(causa, "Não foi possível realizar o cadastro."));
      throw causa;
    }finally {
      setCarregando(false);
    }
  }, []);

  const listar = useCallback(async (): Promise<Usuario[]> => {
    setCarregando(true);
    setErro(null);

    try {
      const lista = await listarUsuarios();
      setUsuarios(lista);
      return lista;
    } catch (causa) {
      setErro(mensagemDoErro(causa, "Não foi possível listar os usuários."));
      throw causa;
    }finally {
      setCarregando(false);
    }
  }, []);

  const buscar = useCallback(async (id: number): Promise<Usuario> => {
    setCarregando(true);
    setErro(null);

    try {
      return await buscarUsuario(id);
    } catch (causa) {
      setErro(mensagemDoErro(causa, "Não foi possível buscar o usuário."));
      throw causa;
    }finally {
      setCarregando(false);
    }
  }, []);

  const editar = useCallback(
    async (id: number, dados: AtualizacaoUsuarioPayload): Promise<Usuario> => {
      setCarregando(true);
      setErro(null);

      try {
        const atualizado = await atualizarUsuario(id, dados);
        setUsuarios((anteriores) =>
          anteriores.map((usuario) =>
            usuario.id === id ? atualizado : usuario,
          ),
        );
        return atualizado;
    } catch (causa) {
      setErro(mensagemDoErro(causa, "Não foi possível atualizar o usuário."));
      throw causa;
    }finally {
        setCarregando(false);
      }
    },
    [],
  );

  const remover = useCallback(async (id: number): Promise<void> => {
    setCarregando(true);
    setErro(null);

    try {
      await removerUsuario(id);
      setUsuarios((anteriores) =>
        anteriores.filter((usuario) => usuario.id !== id),
      );
    } catch (causa) {
      setErro(mensagemDoErro(causa, "Não foi possível remover o usuário."));
      throw causa;
    }finally {
      setCarregando(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      usuarios,
      carregando,
      erro,
      cadastrar,
      listar,
      buscar,
      editar,
      remover,
    }),
    [usuarios, carregando, erro, cadastrar, listar, buscar, editar, remover],
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