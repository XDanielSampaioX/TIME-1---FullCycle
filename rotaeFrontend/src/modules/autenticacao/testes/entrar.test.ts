import { entrar } from "../services/entrar";

const credenciais = { email: "joao@email.com", senha: "senha-forte-123" };

function responderCom(status: number, corpo: unknown) {
  global.fetch = jest.fn().mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    json: async () => corpo,
  });
}

describe("entrar", () => {
  it("envia as credenciais e devolve a sessão", async () => {
    const sessao = { access: "token-access", refresh: "token-refresh", user: { id: 1, nome: "João Silva" } };
    responderCom(200, sessao);

    await expect(entrar(credenciais)).resolves.toEqual({ sessao });
    expect(global.fetch).toHaveBeenCalledWith("/api/v1/auth/login/", expect.objectContaining({
      method: "POST",
      body: JSON.stringify(credenciais),
    }));
  });

  it("devolve a mensagem do backend quando as credenciais são recusadas", async () => {
    responderCom(401, { detail: "E-mail ou senha inválidos." });

    await expect(entrar(credenciais)).resolves.toEqual({ erro: "E-mail ou senha inválidos." });
  });

  it("devolve um erro quando os dados enviados são inválidos", async () => {
    responderCom(400, { email: ["Insira um endereço de e-mail válido."] });

    await expect(entrar(credenciais)).resolves.toEqual({ erro: "Informe um e-mail e uma senha válidos." });
  });

  it("lança erro quando o servidor falha", async () => {
    responderCom(500, {});

    await expect(entrar(credenciais)).rejects.toThrow("Não foi possível entrar.");
  });
});
