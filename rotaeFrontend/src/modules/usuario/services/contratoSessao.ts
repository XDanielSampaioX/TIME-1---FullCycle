import type { LoginUsuarioPayload } from "@/modules/usuario/types/loginUsuarioPayload";
import type { Usuario } from "@/modules/usuario/types/usuario";

export interface ContratoSessao {
  restaurar(): Promise<Usuario | null>;
  entrar(dados: LoginUsuarioPayload): Promise<Usuario>;
  sair(): Promise<void>;
}