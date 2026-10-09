import { SessaoHttp } from "../services/SessaoHttp";
import type { Usuario } from "@/modules/usuario/types/usuario";

const usuario: Usuario = {
  id: 1,
  nome: "Pessoa de teste",
  email: "pessoa@example.com",
};

function resposta(status: number, dados?: unknown): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => dados,
  } as Response;
}

describe("SessaoHttp", () => {
  const fetchMock = jest.fn<Promise<Response>, [RequestInfo | URL, RequestInit?]>(async () => resposta(500));
  const fetchOriginal = global.fetch;
  const servico = new SessaoHttp();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as typeof fetch;
  });

  afterAll(() => {
    global.fetch = fetchOriginal;
  });

  it("envia credenciais ao login e recebe somente os dados do usuário", async () => {
    fetchMock.mockResolvedValueOnce(resposta(200, usuario));

    await expect(servico.entrar({ email: usuario.email, senha: "senha-de-teste" })).resolves.toEqual(usuario);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({
        method: "POST",
        credentials: "same-origin",
        body: JSON.stringify({ email: usuario.email, senha: "senha-de-teste" }),
      }),
    );
  });

  it("informa credenciais inválidas quando o login retorna 401", async () => {
    fetchMock.mockResolvedValueOnce(resposta(401));

    await expect(servico.entrar({ email: usuario.email, senha: "errada" }))
      .rejects.toThrow("E-mail ou senha inválidos.");
  });

  it("trata a falta de sessão como usuário não autenticado", async () => {
    fetchMock.mockResolvedValueOnce(resposta(401));

    await expect(servico.restaurar()).resolves.toBeNull();
  });

  it("compartilha a consulta quando duas partes da tela restauram a mesma sessão", async () => {
    let resolver!: (valor: Response) => void;
    fetchMock.mockImplementationOnce(() => new Promise<Response>((resolve) => { resolver = resolve; }));

    const primeira = servico.restaurar();
    const segunda = servico.restaurar();
    expect(primeira).toBe(segunda);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolver(resposta(200, usuario));
    await expect(primeira).resolves.toEqual(usuario);
  });

  it("mostra falha temporária sem tratar erro 502 como sessão expirada", async () => {
    fetchMock.mockResolvedValueOnce(resposta(502));

    await expect(servico.restaurar()).rejects.toThrow("Não foi possível verificar sua sessão.");
  });

  it("encerra a sessão pelo endpoint do frontend", async () => {
    fetchMock.mockResolvedValueOnce(resposta(204));

    await expect(servico.sair()).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/logout",
      expect.objectContaining({ method: "POST", credentials: "same-origin" }),
    );
  });
});
