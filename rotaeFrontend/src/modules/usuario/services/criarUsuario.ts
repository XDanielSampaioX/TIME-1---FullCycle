import { apiUrl } from "@/lib/api";
import { ErroCadastro } from "@/modules/usuario/types/ErroCadastro";
import type { CadastroUsuarioPayload } from "@/modules/usuario/types/cadastroUsuarioPayload";
import type { Usuario } from "@/modules/usuario/types/usuario";

const nomesCampos: (keyof CadastroUsuarioPayload)[] = [
  "nome",
  "email",
  "senha",
  "celular",
  "dataNasc",
  "cpf",
];

export async function criarUsuario(
  dados: CadastroUsuarioPayload,
): Promise<Usuario> {
  const resposta = await fetch(apiUrl("/api/v1/usuarios/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  if (!resposta.ok) {
    if (resposta.status === 400) {
      const corpo: unknown = await resposta.json().catch(() => null);

      if (corpo && typeof corpo === "object" && !Array.isArray(corpo)) {
        const mensagens = corpo as Record<string, unknown>;
        const campos: Partial<
          Record<keyof CadastroUsuarioPayload, string>
        > = {};

        for (const campo of nomesCampos) {
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

    throw new Error("Não foi possível criar o usuário.");
  }

  return resposta.json() as Promise<Usuario>;
}