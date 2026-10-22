"use client";

import { useState } from "react";
import type { Usuario } from "../types/usuario";
import { useAlteracaoSenha } from "./useAlteracaoSenha";
import { useAtualizacaoUsuario } from "./useAtualizacaoUsuario";

// Um só botão "Salvar alterações" para a tela: junta a edição de dados e a troca de senha.
export function useEdicaoPerfil(usuario: Usuario) {
  const dados = useAtualizacaoUsuario(usuario);
  const senha = useAlteracaoSenha(usuario);
  const [semAlteracaoParaSalvar, setSemAlteracaoParaSalvar] = useState(false);
  const enviando = dados.enviando || senha.enviando;
  const { alterado } = dados;
  // A senha atual sozinha não conta: o navegador pode preenchê-la sem o usuário querer trocar a senha.
  const querTrocarSenha = senha.dados.novaSenha !== "" || senha.dados.confirmacaoNovaSenha !== "";

  async function salvar() {
    dados.limparMensagem();
    senha.limparMensagem();
    setSemAlteracaoParaSalvar(!alterado && !querTrocarSenha);
    if (!alterado && !querTrocarSenha) return;

    // Valida os dois lados antes de enviar qualquer coisa, para não salvar só metade.
    const dadosValidos = !alterado || dados.validar();
    const senhaValida = !querTrocarSenha || senha.validar();
    if (!dadosValidos || !senhaValida) return;

    // A senha vai primeiro: ela grava tokens novos, e depois os dados atualizam o usuário da sessão.
    if (querTrocarSenha && !(await senha.enviar())) return;
    if (alterado) await dados.enviar();
  }

  return { dados, senha, enviando, alterado, querTrocarSenha, semAlteracaoParaSalvar, salvar };
}
