"use client";

import { useState } from "react";
import { useAutenticacao } from "@/modules/autenticacao/hooks/useAutenticacao";
import { regrasAlteracaoSenha } from "../classes/validacao/regrasAlteracaoSenha";
import { regrasAtualizacaoUsuario } from "../classes/validacao/regrasAtualizacaoUsuario";
import { alterarSenha } from "../services/alterarSenha";
import { atualizarUsuario } from "../services/atualizarUsuario";
import type { AlteracaoSenha } from "../types/alteracaoSenha";
import type { AtualizacaoUsuario } from "../types/atualizacaoUsuario";
import type { ErrosValidacao } from "../types/errosValidacao";
import type { Usuario } from "../types/usuario";

// Os campos de dados e de senha têm nomes diferentes, então cabem num objeto só.
export type CamposEdicao = AtualizacaoUsuario & AlteracaoSenha;
export type ErrosEdicao = ErrosValidacao<CamposEdicao>;

// O que a tela mostra de resultado. Qualquer edição volta para "editando", e com isso
// mensagens de uma tentativa anterior nunca ficam na tela.
export type StatusEdicao =
  | { tipo: "editando" }
  | { tipo: "enviando" }
  | { tipo: "semAlteracao" }
  | { tipo: "salvo"; dados: boolean; senha: boolean }
  | { tipo: "erro"; mensagem: string };

const senhaVazia: AlteracaoSenha = { senhaAtual: "", novaSenha: "", confirmacaoNovaSenha: "" };

function dadosDoUsuario(usuario: Usuario): AtualizacaoUsuario {
  return { nome: usuario.nome, email: usuario.email, celular: usuario.celular, dataNasc: usuario.dataNasc ?? "" };
}

// Um só botão "Salvar alterações" para a tela: edita os dados e troca a senha no mesmo fluxo.
export function useEdicaoPerfil(usuario: Usuario) {
  const { atualizarSessao } = useAutenticacao();
  const [campos, setCampos] = useState<CamposEdicao>({ ...dadosDoUsuario(usuario), ...senhaVazia });
  const [erros, setErros] = useState<ErrosEdicao>({});
  const [status, setStatus] = useState<StatusEdicao>({ tipo: "editando" });

  const original = dadosDoUsuario(usuario);
  const dados: AtualizacaoUsuario = {
    nome: campos.nome,
    email: campos.email,
    celular: campos.celular,
    dataNasc: campos.dataNasc,
  };
  const senha: AlteracaoSenha = {
    senhaAtual: campos.senhaAtual,
    novaSenha: campos.novaSenha,
    confirmacaoNovaSenha: campos.confirmacaoNovaSenha,
  };
  const alterado = (Object.keys(original) as (keyof AtualizacaoUsuario)[]).some((campo) => dados[campo] !== original[campo]);
  // A senha atual sozinha não conta: o navegador pode preenchê-la sem o usuário querer trocar a senha.
  const querTrocarSenha = senha.novaSenha !== "" || senha.confirmacaoNovaSenha !== "";

  function alterarCampo(campo: keyof CamposEdicao, valor: string) {
    setCampos((atuais) => ({ ...atuais, [campo]: valor }));
    setStatus({ tipo: "editando" });
  }

  async function salvar() {
    setErros({});

    if (!alterado && !querTrocarSenha) {
      setStatus({ tipo: "semAlteracao" });
      return;
    }

    // Valida só o que vai ser enviado, e tudo antes de enviar qualquer coisa: assim não se salva só metade.
    const errosLocais: ErrosEdicao = {
      ...(alterado ? regrasAtualizacaoUsuario.validar(dados) : {}),
      ...(querTrocarSenha ? regrasAlteracaoSenha.validar(senha) : {}),
    };
    if (Object.keys(errosLocais).length > 0) {
      setErros(errosLocais);
      setStatus({ tipo: "editando" });
      return;
    }

    setStatus({ tipo: "enviando" });
    let senhaAlterada = false;

    try {
      // A senha vai primeiro: ela grava tokens novos, e depois os dados atualizam o usuário da sessão.
      if (querTrocarSenha) {
        const resultado = await alterarSenha(senha);

        if ("erros" in resultado) {
          setErros(resultado.erros);
          setStatus({ tipo: "editando" });
          return;
        }

        // Os tokens antigos deixam de valer assim que a senha muda: grava os novos de imediato.
        atualizarSessao(resultado.tokens);
        setCampos((atuais) => ({ ...atuais, ...senhaVazia }));
        senhaAlterada = true;
      }

      if (alterado) {
        const resultado = await atualizarUsuario(dados);

        if ("erros" in resultado) {
          setErros(resultado.erros);
          setStatus(senhaAlterada ? { tipo: "salvo", dados: false, senha: true } : { tipo: "editando" });
          return;
        }

        atualizarSessao({ user: resultado.usuario });
      }

      setStatus({ tipo: "salvo", dados: alterado, senha: senhaAlterada });
    } catch {
      const falhouNaSenha = querTrocarSenha && !senhaAlterada;
      const mensagem = falhouNaSenha
        ? "Não foi possível alterar a senha. Tente novamente."
        : senhaAlterada
          ? "A senha foi alterada, mas não foi possível salvar os dados. Tente novamente."
          : "Não foi possível salvar as alterações. Tente novamente.";

      setStatus({ tipo: "erro", mensagem });
    }
  }

  return { campos, erros, status, enviando: status.tipo === "enviando", alterarCampo, salvar };
}
