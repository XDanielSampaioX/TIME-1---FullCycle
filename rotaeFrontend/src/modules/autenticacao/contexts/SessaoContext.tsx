"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SessaoNaoConfigurada } from "@/modules/autenticacao/services/SessaoNaoConfigurada";
import type { ContratoSessao } from "@/modules/autenticacao/services/contratoSessao";
import type { EstadoSessao } from "@/modules/autenticacao/types/estadoSessao";
import type { LoginUsuarioPayload } from "@/modules/autenticacao/types/loginUsuarioPayload";
import type { Usuario } from "@/modules/usuario/types/usuario";

type SessaoContextValue = {
  estadoSessao: EstadoSessao;
  usuario: Usuario | null;
  carregando: boolean;
  erro: string | null;
  entrar: (dados: LoginUsuarioPayload) => Promise<void>;
  sair: () => Promise<void>;
  invalidar: () => void;
  atualizarUsuarioDaSessao: (usuario: Usuario) => void;
};

const SessaoContext = createContext<SessaoContextValue | undefined>(undefined);

const sessaoPadrao: ContratoSessao = new SessaoNaoConfigurada();

export function SessaoProvider({
  children,
  servicoSessao = sessaoPadrao,
}: {
  children: ReactNode;
  servicoSessao?: ContratoSessao;
}) {
  const [estadoSessao, setEstadoSessao] = useState<EstadoSessao>({
    status: "carregando",
  });
  const [carregandoAcao, setCarregandoAcao] = useState(false);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const versaoDaSessao = useRef(0);

  useEffect(() => {
    const versaoAtual = ++versaoDaSessao.current;
    let ativo = true;

    void servicoSessao
      .restaurar()
      .then((usuarioRestaurado) => {
        if (!ativo || versaoAtual !== versaoDaSessao.current) return;

        setEstadoSessao(
          usuarioRestaurado
            ? { status: "autenticado", usuario: usuarioRestaurado }
            : { status: "nao_autenticado" },
        );
      })
      .catch(() => {
        if (!ativo || versaoAtual !== versaoDaSessao.current) return;

        setEstadoSessao({
          status: "erro",
          mensagem: "Não foi possível verificar sua sessão.",
        });
      });

    return () => {
  ativo = false;
};
  }, [servicoSessao]);

  const entrar = useCallback(
    async (dados: LoginUsuarioPayload) => {
      const versaoAtual = ++versaoDaSessao.current;
      setCarregandoAcao(true);
      setErroAcao(null);

      try {
        const usuarioAutenticado = await servicoSessao.entrar(dados);
        if (versaoAtual === versaoDaSessao.current) {
          setEstadoSessao({
            status: "autenticado",
            usuario: usuarioAutenticado,
          });
        }
      } catch {
        setErroAcao("Não foi possível entrar. Verifique a disponibilidade do login.");
        throw new Error("Falha no login do usuário.");
      } finally {
        setCarregandoAcao(false);
      }
    },
    [servicoSessao],
  );

  const sair = useCallback(async () => {
    const versaoAtual = ++versaoDaSessao.current;
    setCarregandoAcao(true);
    setErroAcao(null);

    try {
      await servicoSessao.sair();
      if (versaoAtual === versaoDaSessao.current) {
        setEstadoSessao({ status: "nao_autenticado" });
      }
    } catch {
      setErroAcao("Não foi possível encerrar a sessão.");
      throw new Error("Falha ao sair da sessão.");
    } finally {
      setCarregandoAcao(false);
    }
  }, [servicoSessao]);

  const invalidar = useCallback(() => {
    versaoDaSessao.current++;
    setEstadoSessao({ status: "nao_autenticado" });
  }, []);

  const atualizarUsuarioDaSessao = useCallback((usuarioAtualizado: Usuario) => {
    setEstadoSessao((estadoAnterior) =>
      estadoAnterior.status === "autenticado"
        ? { status: "autenticado", usuario: usuarioAtualizado }
        : estadoAnterior,
    );
  }, []);

  const usuario =
    estadoSessao.status === "autenticado" ? estadoSessao.usuario : null;
  const carregando = estadoSessao.status === "carregando" || carregandoAcao;
  const erro =
    erroAcao ?? (estadoSessao.status === "erro" ? estadoSessao.mensagem : null);

  const value = useMemo(
    () => ({
      estadoSessao,
      usuario,
      carregando,
      erro,
      entrar,
      sair,
      invalidar,
      atualizarUsuarioDaSessao,
    }),
    [
      estadoSessao,
      usuario,
      carregando,
      erro,
      entrar,
      sair,
      invalidar,
      atualizarUsuarioDaSessao,
    ],
  );

  return <SessaoContext.Provider value={value}>{children}</SessaoContext.Provider>;
}

export function useSessao() {
  const context = useContext(SessaoContext);
  if (!context) {
    throw new Error("useSessao deve ser usado dentro de SessaoProvider.");
  }
  return context;
}