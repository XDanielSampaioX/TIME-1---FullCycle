"use client";

import type { Usuario } from "../types/usuario";
import { useAlteracaoSenha } from "./useAlteracaoSenha";
import { useAtualizacaoUsuario } from "./useAtualizacaoUsuario";

// Um só botão "Salvar alterações" para a tela: junta a edição de dados e a troca de senha.
export function useEdicaoPerfil(usuario: Usuario) {
  const dados = useAtualizacaoUsuario(usuario);
  const senha = useAlteracaoSenha(usuario);
  const enviando = dados.enviando || senha.enviando;

  async function salvar() {
    const querTrocarSenha = Object.values(senha.dados).some((valor) => valor !== "");

    // A senha vai primeiro: ela grava tokens novos, e depois os dados atualizam o usuário da sessão.
    if (querTrocarSenha && !(await senha.enviar())) return;
    await dados.enviar();
  }

  return { dados, senha, enviando, salvar };
}
