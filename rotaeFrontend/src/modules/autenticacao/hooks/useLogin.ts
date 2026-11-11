"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { entrar } from "../services/entrar";
import type { ErrosValidacao } from "@/modules/usuario/types/errosValidacao";
import type { Credenciais } from "../types/credenciais";
import { regrasLogin } from "../utils/regrasLogin";
import { useAutenticacao } from "./useAutenticacao";

// destino já chega validado pela página (só caminhos deste site).
export function useLogin(destino: string) {
  const { iniciarSessao } = useAutenticacao();
  const router = useRouter();
  const [credenciais, setCredenciais] = useState<Credenciais>({ email: "", senha: "" });
  const [lembrar, setLembrar] = useState(false);
  // erros: um por campo (validação local). erro: resposta do servidor, que não aponta um campo.
  const [erros, setErros] = useState<ErrosValidacao<Credenciais>>({});
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function alterarCampo(campo: keyof Credenciais, valor: string) {
    setCredenciais({ ...credenciais, [campo]: valor });
    // O erro do campo some assim que o usuário volta a digitar nele.
    setErros({ ...erros, [campo]: undefined });
  }

  async function enviar() {
    const errosDosCampos = regrasLogin.validar(credenciais);
    setErros(errosDosCampos);
    setErro(null);
    if (Object.keys(errosDosCampos).length > 0) return;

    setEnviando(true);
    try {
      const resultado = await entrar(credenciais);

      if ("erro" in resultado) {
        setErro(resultado.erro);
      } else {
        iniciarSessao(resultado.sessao, lembrar);
        // replace: o botão "voltar" do navegador não traz de novo a tela de login.
        router.replace(destino);
      }
    } catch {
      setErro("Não foi possível entrar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return { credenciais, lembrar, erros, erro, enviando, alterarCampo, setLembrar, enviar };
}
