import { fetchAutenticado } from "../services/fetchAutenticado";
import type { Sessao } from "../types/sessao";
import { lerSessao, salvarSessao } from "../utils/sessaoSalva";

const sessao = { access: "access-antigo", refresh: "refresh-antigo", user: { id: 1, nome: "João Silva" } } as Sessao;

function resposta(status: number, corpo: unknown = {}) {
  return { status, ok: status >= 200 && status < 300, json: async () => corpo };
}

function tokenEnviado(chamada: number) {
  const opcoes = (global.fetch as jest.Mock).mock.calls[chamada][1] as RequestInit | undefined;
  return new Headers(opcoes?.headers).get("Authorization");
}

describe("fetchAutenticado", () => {
  beforeEach(() => localStorage.clear());

  it("repassa a requisição sem token quando não há sessão", async () => {
    global.fetch = jest.fn().mockResolvedValue(resposta(401));

    await expect(fetchAutenticado("/api/v1/me/")).resolves.toMatchObject({ status: 401 });
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(tokenEnviado(0)).toBeNull();
  });

  it("envia o token da sessão", async () => {
    salvarSessao(sessao);
    global.fetch = jest.fn().mockResolvedValue(resposta(200));

    await expect(fetchAutenticado("/api/v1/me/")).resolves.toMatchObject({ status: 200 });
    expect(tokenEnviado(0)).toBe("Bearer access-antigo");
  });

  it("renova os tokens e repete a requisição quando o access token expirou", async () => {
    salvarSessao(sessao);
    global.fetch = jest.fn()
      .mockResolvedValueOnce(resposta(401))
      .mockResolvedValueOnce(resposta(200, { access: "access-novo", refresh: "refresh-novo" }))
      .mockResolvedValueOnce(resposta(200));

    await expect(fetchAutenticado("/api/v1/me/")).resolves.toMatchObject({ status: 200 });
    expect(tokenEnviado(2)).toBe("Bearer access-novo");
    expect(lerSessao()).toEqual({ ...sessao, access: "access-novo", refresh: "refresh-novo" });
  });

  it("encerra a sessão quando o refresh token também é recusado", async () => {
    salvarSessao(sessao);
    global.fetch = jest.fn().mockResolvedValue(resposta(401));

    await expect(fetchAutenticado("/api/v1/me/")).resolves.toMatchObject({ status: 401 });
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(lerSessao()).toBeNull();
  });

  it("faz uma única renovação para requisições simultâneas", async () => {
    salvarSessao(sessao);
    global.fetch = jest.fn((url: string, opcoes?: RequestInit) => {
      if (url.includes("/auth/refresh/")) return Promise.resolve(resposta(200, { access: "access-novo", refresh: "refresh-novo" }));
      const token = new Headers(opcoes?.headers).get("Authorization");
      return Promise.resolve(resposta(token === "Bearer access-novo" ? 200 : 401));
    }) as jest.Mock;

    const respostas = await Promise.all([fetchAutenticado("/api/v1/me/"), fetchAutenticado("/api/v1/me/")]);

    expect(respostas.map((item) => item.status)).toEqual([200, 200]);
    expect((global.fetch as jest.Mock).mock.calls.filter(([url]) => url.includes("/auth/refresh/"))).toHaveLength(1);
  });
});
