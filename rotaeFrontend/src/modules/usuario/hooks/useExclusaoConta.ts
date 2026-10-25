"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAutenticacao } from "@/modules/autenticacao/hooks/useAutenticacao";
import { excluirConta } from "../services/excluirConta";

export function useExclusaoConta() {
  const { sair } = useAutenticacao();
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function pedirConfirmacao() {
    setErro(null);
    setConfirmando(true);
  }

  function cancelar() {
    setConfirmando(false);
  }

  async function confirmar() {
    setErro(null);
    setExcluindo(true);
    try {
      await excluirConta();
      // Navega antes de encerrar a sessão: assim a tela de perfil não pisca "Entre na sua conta"
      // e o "voltar" do navegador não leva de novo ao perfil.
      router.replace("/");
      sair();
    } catch {
      setErro("Não foi possível excluir a conta. Tente novamente.");
    } finally {
      setExcluindo(false);
    }
  }

  return { confirmando, excluindo, erro, pedirConfirmacao, cancelar, confirmar };
}
