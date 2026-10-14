import { atualizarUsuario } from "../services/atualizarUsuario";
import type { AtualizacaoUsuario } from "../types/atualizacaoUsuario";

const dados: AtualizacaoUsuario = { nome: "João Silva", email: "joao@email.com", celular: "85999990000", dataNasc: "1995-04-20" };

function resposta(status: number, corpo: unknown = {}) {
  return { status, ok: status >= 200 && status < 300, json: async () => corpo };
}

describe("atualizarUsuario", () => {
  beforeEach(() => localStorage.clear());

  it("envia os dados por PATCH em /me/ e devolve o usuário atualizado", async () => {
    const usuario = { id: 1, ...dados };
    global.fetch = jest.fn().mockResolvedValue(resposta(200, usuario));

    await expect(atualizarUsuario(dados)).resolves.toEqual({ usuario });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/me/"),
      expect.objectContaining({ method: "PATCH", body: JSON.stringify(dados) }),
    );
  });

  it("devolve a primeira mensagem de cada campo recusado pelo backend", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      resposta(400, { email: ["Já existe um usuário com este e-mail.", "Outra"], celular: ["Celular inválido."] }),
    );

    await expect(atualizarUsuario(dados)).resolves.toEqual({
      erros: { email: "Já existe um usuário com este e-mail.", celular: "Celular inválido." },
    });
  });

  it("lança erro quando o servidor falha", async () => {
    global.fetch = jest.fn().mockResolvedValue(resposta(500));

    await expect(atualizarUsuario(dados)).rejects.toThrow("Não foi possível atualizar os dados.");
  });
});
