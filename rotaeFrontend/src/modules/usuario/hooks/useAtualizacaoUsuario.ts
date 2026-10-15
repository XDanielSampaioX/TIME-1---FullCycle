"use client";

import { useState } from "react";
import { useAutenticacao } from "@/modules/autenticacao/hooks/useAutenticacao";
import { lerSessao } from "@/modules/autenticacao/utils/sessaoSalva";
import { regrasAtualizacaoUsuario } from "../classes/validacao/regrasAtualizacaoUsuario";
import { atualizarUsuario } from "../services/atualizarUsuario";
import type { AtualizacaoUsuario } from "../types/atualizacaoUsuario";
import type { ErrosValidacao } from "../types/errosValidacao";
import type { Usuario } from "../types/usuario";

export function useAtualizacaoUsuario(usuario: Usuario) {
  const { iniciarSessao } = useAutenticacao();
  // Contas criadas pelo admin (createsuperuser) podem não ter celular nem data de nascimento.
  const [dados, setDados] = useState<AtualizacaoUsuario>({
    nome: usuario.nome,
    email: usuario.email,
    celular: usuario.celular ?? "",
    dataNasc: usuario.dataNasc ?? "",
  });
  const [erros, setErros] = useState<ErrosValidacao<AtualizacaoUsuario>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  function alterarCampo(campo: keyof AtualizacaoUsuario, valor: string) {
    setDados({ ...dados, [campo]: valor });
    setSalvo(false);
  }

  async function enviar() {
    const errosLocais = regrasAtualizacaoUsuario.validar(dados);
    setErros(errosLocais);
    setErroGeral(null);
    setSalvo(false);
    if (Object.keys(errosLocais).length > 0) return;

    setEnviando(true);
    try {
      const resultado = await atualizarUsuario(dados);

      if ("erros" in resultado) {
        setErros(resultado.erros);
        return;
      }

      // Relê a sessão: o fetch autenticado pode ter renovado os tokens durante a requisição.
      const sessao = lerSessao();
      if (sessao) iniciarSessao({ ...sessao, user: resultado.usuario });
      setSalvo(true);
    } catch {
      setErroGeral("Não foi possível salvar as alterações. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return { dados, erros, erroGeral, enviando, salvo, alterarCampo, enviar };
}
