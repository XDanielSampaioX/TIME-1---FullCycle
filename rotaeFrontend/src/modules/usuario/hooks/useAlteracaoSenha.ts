"use client";

import { useState } from "react";
import { useAutenticacao } from "@/modules/autenticacao/hooks/useAutenticacao";
import { regrasAlteracaoSenha } from "../classes/validacao/regrasAlteracaoSenha";
import { alterarSenha } from "../services/alterarSenha";
import type { AlteracaoSenha } from "../types/alteracaoSenha";
import type { ErrosValidacao } from "../types/errosValidacao";
import type { Usuario } from "../types/usuario";

const camposVazios: AlteracaoSenha = { senhaAtual: "", novaSenha: "", confirmacaoNovaSenha: "" };

export function useAlteracaoSenha(usuario: Usuario) {
  const { iniciarSessao } = useAutenticacao();
  const [dados, setDados] = useState<AlteracaoSenha>(camposVazios);
  const [erros, setErros] = useState<ErrosValidacao<AlteracaoSenha>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [alterada, setAlterada] = useState(false);

  function alterarCampo(campo: keyof AlteracaoSenha, valor: string) {
    setDados({ ...dados, [campo]: valor });
    setAlterada(false);
  }

  async function enviar(): Promise<boolean> {
    const errosLocais = regrasAlteracaoSenha.validar(dados);
    setErros(errosLocais);
    setErroGeral(null);
    setAlterada(false);
    if (Object.keys(errosLocais).length > 0) return false;

    setEnviando(true);
    try {
      const resultado = await alterarSenha(dados);

      if ("erros" in resultado) {
        setErros(resultado.erros);
        return false;
      }

      // Os tokens antigos deixam de valer assim que a senha muda: grava os novos de imediato.
      iniciarSessao({ ...resultado.tokens, user: usuario });
      setDados(camposVazios);
      setAlterada(true);
      return true;
    } catch {
      setErroGeral("Não foi possível alterar a senha. Tente novamente.");
      return false;
    } finally {
      setEnviando(false);
    }
  }

  return { dados, erros, erroGeral, enviando, alterada, alterarCampo, enviar };
}
