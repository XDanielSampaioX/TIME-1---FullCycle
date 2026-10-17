"use client";

import { useEstadoMenuUsuario } from "../hooks/useEstadoMenuUsuario";
import { MenuUsuario } from "./MenuUsuario";

// Liga o menu (só visual) ao estado real da sessão.
export function MenuUsuarioConectado() {
  const { estado, usuario, sessaoIndisponivel, sair } = useEstadoMenuUsuario();

  return <MenuUsuario estado={estado} usuario={usuario} sessaoIndisponivel={sessaoIndisponivel} aoSair={sair} />;
}
