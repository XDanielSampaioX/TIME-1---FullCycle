"use client";

import { useEffect, useState } from "react";
import { useAutenticacao } from "@/modules/autenticacao/hooks/useAutenticacao";
import { buscarUsuarioAutenticado } from "@/modules/autenticacao/services/buscarUsuarioAutenticado";
import type { EstadoMenuUsuario } from "../types/estadoMenuUsuario";
import { useClienteMontado } from "./useClienteMontado";

export function useEstadoMenuUsuario() {
  const { usuario, sair } = useAutenticacao();
  const montado = useClienteMontado();
  const [servidorFalhou, setServidorFalhou] = useState(false);
  const logado = usuario !== null;

  // Sessão indisponível = há sessão salva, mas o servidor não respondeu para confirmá-la.
  useEffect(() => {
    if (!logado) return;

    let ativo = true;
    buscarUsuarioAutenticado()
      .then(() => ativo && setServidorFalhou(false))
      .catch(() => ativo && setServidorFalhou(true));

    return () => {
      ativo = false;
    };
  }, [logado]);

  const estado: EstadoMenuUsuario = !montado ? "carregando" : logado ? "autenticado" : "anonimo";

  return { estado, usuario, sessaoIndisponivel: logado && servidorFalhou, sair };
}
