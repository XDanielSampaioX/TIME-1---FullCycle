/** @jest-environment node */

import { NextRequest } from "next/server";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as logout } from "@/app/api/auth/logout/route";
import { GET as sessao } from "@/app/api/auth/session/route";

const usuario = { id: 1, nome: "Pessoa de teste", email: "pessoa@example.com" };

function pedido(caminho: string, cookies = "", dados?: unknown): NextRequest {
  return new NextRequest(`http://localhost:3000${caminho}`, {
    method: dados === undefined ? "GET" : "POST",
    headers: cookies ? { cookie: cookies } : undefined,
    body: dados === undefined ? undefined : JSON.stringify(dados),
  });
}

describe("rotas de autenticação do frontend", () => {
  const fetchOriginal = global.fetch;
  const fetchMock = jest.fn<Promise<Response>, [RequestInfo | URL, RequestInit?]>(async () =>
    Response.json({ detail: "Resposta não configurada no teste." }, { status: 500 }),
  );

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as typeof fetch;
  });

  afterAll(() => {
    global.fetch = fetchOriginal;
  });

  it("guarda access e refresh em cookies HttpOnly e não os devolve no JSON do login", async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ access: "access-1", refresh: "refresh-1", user: usuario }));

    const resposta = await login(pedido("/api/auth/login", "", { email: usuario.email, senha: "senha-de-teste" }));

    expect(resposta.status).toBe(200);
    expect(await resposta.json()).toEqual(usuario);
    expect(resposta.cookies.get("rotae_access")?.value).toBe("access-1");
    expect(resposta.cookies.get("rotae_refresh")?.value).toBe("refresh-1");
    expect(resposta.headers.get("set-cookie")).toMatch(/httponly/i);
  });

  it("renova e salva os dois tokens quando o access expira", async () => {
    fetchMock
      .mockResolvedValueOnce(Response.json({ detail: "Expirado." }, { status: 401 }))
      .mockResolvedValueOnce(Response.json({ access: "access-2", refresh: "refresh-2" }))
      .mockResolvedValueOnce(Response.json(usuario));

    const resposta = await sessao(pedido("/api/auth/session", "rotae_access=expirado; rotae_refresh=refresh-1"));

    expect(resposta.status).toBe(200);
    expect(await resposta.json()).toEqual(usuario);
    expect(resposta.cookies.get("rotae_access")?.value).toBe("access-2");
    expect(resposta.cookies.get("rotae_refresh")?.value).toBe("refresh-2");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(String(fetchMock.mock.calls[1][0])).toContain("/api/v1/auth/refresh/");
  });

  it("limpa os cookies se a renovação for recusada", async () => {
    fetchMock
      .mockResolvedValueOnce(Response.json({ detail: "Expirado." }, { status: 401 }))
      .mockResolvedValueOnce(Response.json({ detail: "Refresh inválido." }, { status: 401 }));

    const resposta = await sessao(pedido("/api/auth/session", "rotae_access=expirado; rotae_refresh=invalido"));

    expect(resposta.status).toBe(401);
    expect(resposta.cookies.get("rotae_access")?.value).toBe("");
    expect(resposta.cookies.get("rotae_refresh")?.value).toBe("");
  });

  it("preserva o refresh rotacionado se a consulta do perfil falhar temporariamente", async () => {
    fetchMock
      .mockResolvedValueOnce(Response.json({ detail: "Expirado." }, { status: 401 }))
      .mockResolvedValueOnce(Response.json({ access: "access-2", refresh: "refresh-2" }))
      .mockResolvedValueOnce(Response.json({ detail: "Indisponível." }, { status: 503 }));

    const resposta = await sessao(pedido("/api/auth/session", "rotae_access=expirado; rotae_refresh=refresh-1"));

    expect(resposta.status).toBe(502);
    expect(resposta.cookies.get("rotae_access")?.value).toBe("access-2");
    expect(resposta.cookies.get("rotae_refresh")?.value).toBe("refresh-2");
  });

  it("encerra a sessão local mesmo se a rota de revogação ainda retornar 404", async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ detail: "Não disponível." }, { status: 404 }));

    const resposta = await logout(pedido("/api/auth/logout", "rotae_refresh=refresh-1", {}));

    expect(resposta.status).toBe(204);
    expect(resposta.cookies.get("rotae_access")?.value).toBe("");
    expect(resposta.cookies.get("rotae_refresh")?.value).toBe("");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
