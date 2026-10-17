import { renderHook, waitFor } from "@testing-library/react";
import { buscarUsuarioAutenticado } from "@/modules/autenticacao/services/buscarUsuarioAutenticado";
import { useEstadoMenuUsuario } from "../hooks/useEstadoMenuUsuario";
import type { Usuario } from "../types/usuario";

const useAutenticacao = jest.fn();

jest.mock("@/modules/autenticacao/hooks/useAutenticacao", () => ({ useAutenticacao: () => useAutenticacao() }));
jest.mock("@/modules/autenticacao/services/buscarUsuarioAutenticado");

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

  it("é anônimo e não consulta o servidor quando não há sessão", () => {
    useAutenticacao.mockReturnValue({ usuario: null, sair: jest.fn() });
    const { result } = renderHook(() => useEstadoMenuUsuario());

    expect(result.current.estado).toBe("anonimo");
    expect(result.current.sessaoIndisponivel).toBe(false);
    expect(buscarUsuarioAutenticado).not.toHaveBeenCalled();
  });

  it("é autenticado quando o servidor confirma a sessão", async () => {
    useAutenticacao.mockReturnValue({ usuario, sair: jest.fn() });
    jest.mocked(buscarUsuarioAutenticado).mockResolvedValue(usuario);
    const { result } = renderHook(() => useEstadoMenuUsuario());

    await waitFor(() => expect(buscarUsuarioAutenticado).toHaveBeenCalledTimes(1));
    expect(result.current.estado).toBe("autenticado");
    expect(result.current.sessaoIndisponivel).toBe(false);
  });

  it("marca a sessão como indisponível quando o servidor não responde, mantendo o usuário", async () => {
    useAutenticacao.mockReturnValue({ usuario, sair: jest.fn() });
    jest.mocked(buscarUsuarioAutenticado).mockRejectedValue(new Error("sem rede"));
    const { result } = renderHook(() => useEstadoMenuUsuario());

    await waitFor(() => expect(result.current.sessaoIndisponivel).toBe(true));
    expect(result.current.estado).toBe("autenticado");
    expect(result.current.usuario).toBe(usuario);
  });
});
