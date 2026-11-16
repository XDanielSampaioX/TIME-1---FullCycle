"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { entrar } from "../services/entrar";
import type { Credenciais } from "../types/credenciais";
import { useAutenticacao } from "./useAutenticacao";

// ?retorno= traz a tela que mandou para o login. Só aceita endereços deste site: a conferência
// é feita pela origem, porque o navegador ignora tabulações e quebras de linha no endereço.
function obterRetorno() {
  const retorno = new URL(new URLSearchParams(window.location.search).get("retorno") ?? "/", window.location.origin);
  return retorno.origin === window.location.origin ? `${retorno.pathname}${retorno.search}${retorno.hash}` : "/";
}

export function useLogin() {
  const { iniciarSessao } = useAutenticacao();
  const router = useRouter();
  const [credenciais, setCredenciais] = useState<Credenciais>({ email: "", senha: "" });
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function alterarCampo(campo: keyof Credenciais, valor: string) {
    setCredenciais({ ...credenciais, [campo]: valor });
  }

  async function enviar() {
    setErro(null);
    setEnviando(true);
    try {
      const resultado = await entrar(credenciais);

      if ("erro" in resultado) {
        setErro(resultado.erro);
      } else {
        iniciarSessao(resultado.sessao);
        router.push(obterRetorno());
      }
    } catch {
      setErro("Não foi possível entrar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return { credenciais, erro, enviando, alterarCampo, enviar };
}
