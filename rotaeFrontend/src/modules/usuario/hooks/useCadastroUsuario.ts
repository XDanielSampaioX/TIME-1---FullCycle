"use client";

import { useState } from "react";
import { regrasCadastroUsuario } from "../classes/regrasCadastroUsuario";
import { cadastrarUsuario } from "../services/cadastrarUsuario";
import type { CadastroUsuario } from "../types/cadastroUsuario";
import type { ErrosCadastroUsuario } from "../types/errosCadastroUsuario";
import type { Usuario } from "../types/usuario";

export function useCadastroUsuario() {
  const [dados, setDados] = useState<CadastroUsuario>({
    nome: "",
    cpf: "",
    dataNasc: "",
    celular: "",
    email: "",
    senha: "",
  });
  const [erros, setErros] = useState<ErrosCadastroUsuario>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  function alterarCampo(campo: keyof CadastroUsuario, valor: string) {
    setDados({ ...dados, [campo]: valor });
  }

  async function enviar() {
    const errosLocais = regrasCadastroUsuario.validar(dados);
    setErros(errosLocais);
    setErroGeral(null);
    if (Object.keys(errosLocais).length > 0) return;

    setEnviando(true);
    try {
      const resultado = await cadastrarUsuario(dados);

      if ("erros" in resultado) setErros(resultado.erros);
      else setUsuario(resultado.usuario);
    } catch {
      setErroGeral("Não foi possível criar a conta. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return { dados, erros, erroGeral, enviando, usuario, alterarCampo, enviar };
}
