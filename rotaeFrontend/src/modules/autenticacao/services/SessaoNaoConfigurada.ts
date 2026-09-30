import type { ContratoSessao } from "./contratoSessao";
import type { Usuario } from "@/modules/usuario/types/usuario";

export class SessaoNaoConfigurada implements ContratoSessao {
  async restaurar(): Promise<Usuario | null> {
    return null;
  }

  async entrar(): Promise<Usuario> {
    throw new Error("O login ainda não está disponível no backend.");
  }

  async sair(): Promise<void> {
    // Não há uma sessão no backend para encerrar.
  }
}