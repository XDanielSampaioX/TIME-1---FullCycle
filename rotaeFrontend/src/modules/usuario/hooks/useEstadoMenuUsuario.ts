"use client";

import { useAutenticacao } from "@/modules/autenticacao/hooks/useAutenticacao";
import { useClienteMontado } from "@/shared/hooks/useClienteMontado";
import type { EstadoMenuUsuario } from "../types/estadoMenuUsuario";

// Só lê a sessão do contexto: quem confirma a sessão no servidor (/me/) é o AutenticacaoProvider.
export function useEstadoMenuUsuario() {
  const { usuario, sessaoIndisponivel, sair } = useAutenticacao();
  const montado = useClienteMontado();

  const estado: EstadoMenuUsuario = !montado ? "carregando" : usuario ? "autenticado" : "anonimo";

  return { estado, usuario, sessaoIndisponivel, sair };
}
