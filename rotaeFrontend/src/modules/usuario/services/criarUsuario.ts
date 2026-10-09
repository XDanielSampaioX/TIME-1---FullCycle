import { exigirSucesso, requisitarApi } from "@/lib/requisicaoApi";
import { ErroCadastro } from "@/modules/usuario/types/ErroCadastro";
import { CAMPOS_CADASTRO, type CadastroUsuarioPayload, type CampoCadastro } from "@/modules/usuario/types/cadastroUsuarioPayload";
import type { Usuario } from "@/modules/usuario/types/usuario";

export async function criarUsuario(
  dados: CadastroUsuarioPayload,
): Promise<Usuario> {
  const resposta = await requisitarApi("/api/v1/usuarios/", {
    method: "POST",
    body: JSON.stringify(dados),
  });

  if (!resposta.ok) {
    if (resposta.status === 400) {
      const corpo: unknown = await resposta.json().catch(() => null);

      if (corpo && typeof corpo === "object" && !Array.isArray(corpo)) {
        const mensagens = corpo as Record<string, unknown>;
        const campos: Partial<Record<CampoCadastro, string>> = {};

        for (const campo of CAMPOS_CADASTRO) {
          const valor = mensagens[campo];
          const mensagem = Array.isArray(valor)
            ? valor.find((item) => typeof item === "string")
            : valor;

          if (typeof mensagem === "string") {
            campos[campo] = mensagem;
          }
        }

        if (Object.keys(campos).length > 0) {
          throw new ErroCadastro(campos);
        }
      }
    }

  }

  exigirSucesso(resposta, "Não foi possível criar o usuário.");
  return resposta.json() as Promise<Usuario>;
}
