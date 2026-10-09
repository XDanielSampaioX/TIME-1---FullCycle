import { exigirSucesso, requisitarApi } from "@/lib/requisicaoApi";
import type { ContratoSessao } from "./contratoSessao";
import type { LoginUsuarioPayload } from "@/modules/autenticacao/types/loginUsuarioPayload";
import type { Usuario } from "@/modules/usuario/types/usuario";

let restauracaoPendente: Promise<Usuario | null> | null = null;

export class SessaoHttp implements ContratoSessao {
  private async consultarSessao(): Promise<Usuario | null> {
    const resposta = await requisitarApi("/api/auth/session");
    if (resposta.status === 401) return null;
    exigirSucesso(resposta, "Não foi possível verificar sua sessão.");
    return resposta.json() as Promise<Usuario>;
  }

  restaurar(): Promise<Usuario | null> {
    if (restauracaoPendente) return restauracaoPendente;
    const promessa = this.consultarSessao();
    restauracaoPendente = promessa;
    void promessa.finally(() => {
      if (restauracaoPendente === promessa) restauracaoPendente = null;
    }).catch(() => undefined);
    return promessa;
  }

  async entrar(dados: LoginUsuarioPayload): Promise<Usuario> {
    const resposta = await requisitarApi("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(dados),
    });
    exigirSucesso(resposta, resposta.status === 401
      ? "E-mail ou senha inválidos."
      : "Não foi possível entrar. Tente novamente.");
    return resposta.json() as Promise<Usuario>;
  }

  async sair(): Promise<void> {
    const resposta = await requisitarApi("/api/auth/logout", { method: "POST" });
    exigirSucesso(resposta, "Não foi possível encerrar sua sessão.");
  }
}
