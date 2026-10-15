import { alterarSenha } from "../services/alterarSenha";
import type { AlteracaoSenha } from "../types/alteracaoSenha";

const dados: AlteracaoSenha = { senhaAtual: "antiga-123", novaSenha: "nova-senha-123", confirmacaoNovaSenha: "nova-senha-123" };

function resposta(status: number, corpo: unknown = {}) {
  return { status, ok: status >= 200 && status < 300, json: async () => corpo };
}

describe("alterarSenha", () => {
  beforeEach(() => localStorage.clear());

  it("envia os três campos por POST em /me/senha/ e devolve os tokens novos", async () => {
    const tokens = { access: "access-novo", refresh: "refresh-novo" };
    global.fetch = jest.fn().mockResolvedValue(resposta(200, tokens));

    await expect(alterarSenha(dados)).resolves.toEqual({ tokens });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/me/senha/"),
      expect.objectContaining({ method: "POST", body: JSON.stringify(dados) }),
    );
  });

  it("devolve a mensagem do campo recusado pelo backend", async () => {
    global.fetch = jest.fn().mockResolvedValue(resposta(400, { senhaAtual: ["Senha atual incorreta."] }));

    await expect(alterarSenha(dados)).resolves.toEqual({ erros: { senhaAtual: "Senha atual incorreta." } });
  });

  it("lança erro quando o servidor falha", async () => {
    global.fetch = jest.fn().mockResolvedValue(resposta(500));

    await expect(alterarSenha(dados)).rejects.toThrow("Não foi possível alterar a senha.");
  });
});
