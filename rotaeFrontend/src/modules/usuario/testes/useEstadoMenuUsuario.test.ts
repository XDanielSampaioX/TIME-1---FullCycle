import { renderHook } from "@testing-library/react";
import { useEstadoMenuUsuario } from "../hooks/useEstadoMenuUsuario";
import type { Usuario } from "../types/usuario";

const useAutenticacao = jest.fn();

jest.mock("@/modules/autenticacao/hooks/useAutenticacao", () => ({ useAutenticacao: () => useAutenticacao() }));

const usuario: Usuario = {
  id: 1,
  nome: "Snow",
  email: "snow@email.com",
  celular: "(85) 99999-0000",
  dataNasc: "1995-04-20",
  cpf: "529.982.247-25",
  criadoEm: "2026-10-01T10:00:00Z",
  atualizadoEm: "2026-10-01T10:00:00Z",
};

describe("useEstadoMenuUsuario", () => {
  beforeEach(() => jest.resetAllMocks());

  it("é anônimo quando não há sessão", () => {
    useAutenticacao.mockReturnValue({ usuario: null, sessaoIndisponivel: false, sair: jest.fn() });
    const { result } = renderHook(() => useEstadoMenuUsuario());

    expect(result.current.estado).toBe("anonimo");
    expect(result.current.sessaoIndisponivel).toBe(false);
  });

  it("é autenticado quando há usuário na sessão", () => {
    useAutenticacao.mockReturnValue({ usuario, sessaoIndisponivel: false, sair: jest.fn() });
    const { result } = renderHook(() => useEstadoMenuUsuario());

    expect(result.current.estado).toBe("autenticado");
    expect(result.current.usuario).toBe(usuario);
    expect(result.current.sessaoIndisponivel).toBe(false);
  });

  it("repassa o aviso de sessão indisponível do contexto, mantendo o usuário", () => {
    useAutenticacao.mockReturnValue({ usuario, sessaoIndisponivel: true, sair: jest.fn() });
    const { result } = renderHook(() => useEstadoMenuUsuario());

    expect(result.current.estado).toBe("autenticado");
    expect(result.current.sessaoIndisponivel).toBe(true);
  });
});
