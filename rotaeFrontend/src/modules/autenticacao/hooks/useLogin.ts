"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { entrar } from "../services/entrar";
import type { Credenciais } from "../types/credenciais";
import { useAutenticacao } from "./useAutenticacao";

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
        router.push("/");
      }
    } catch {
      setErro("Não foi possível entrar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return { credenciais, erro, enviando, alterarCampo, enviar };
}
