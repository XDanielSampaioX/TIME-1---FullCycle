import type { LoginUsuarioPayload } from "@/modules/autenticacao/types/loginUsuarioPayload";
import type { TokenUser } from "@/modules/autenticacao/types/tokenUser";
import type { Usuario } from "@/modules/usuario/types/usuario";

export interface ContratoSessao {
  restaurar(): Promise<Usuario | null>;
  entrar(dados: LoginUsuarioPayload): Promise<TokenUser>;
  sair(): Promise<void>;
}
