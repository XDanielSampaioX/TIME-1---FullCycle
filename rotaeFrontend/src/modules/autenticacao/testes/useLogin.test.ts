import { act, renderHook } from "@testing-library/react";
import { useAutenticacao } from "../hooks/useAutenticacao";
import { useLogin } from "../hooks/useLogin";
import { entrar } from "../services/entrar";

const push = jest.fn();

jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
jest.mock("../hooks/useAutenticacao");
jest.mock("../services/entrar");

async function entrarVindoDe(retorno: string | null) {
  const busca = retorno === null ? "" : `?${new URLSearchParams({ retorno })}`;
  window.history.replaceState(null, "", `/login${busca}`);
  const { result } = renderHook(() => useLogin());

  await act(() => result.current.enviar());

  return push.mock.calls[0][0];
}

describe("useLogin", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(useAutenticacao).mockReturnValue({ iniciarSessao: jest.fn() } as unknown as ReturnType<typeof useAutenticacao>);
    jest.mocked(entrar).mockResolvedValue({ sessao: {} } as Awaited<ReturnType<typeof entrar>>);
  });

  it("volta para a tela que mandou para o login", async () => {
    await expect(entrarVindoDe("/viagens/7/assentos?origem=1&assentos=101,102")).resolves
      .toBe("/viagens/7/assentos?origem=1&assentos=101,102");
  });

  it("vai para o início sem retorno", async () => {
    await expect(entrarVindoDe(null)).resolves.toBe("/");
  });

  it.each(["//evil.com", "/\\evil.com", "/\t/evil.com", "https://evil.com"])("não sai do site com o retorno %j", async (retorno) => {
    await expect(entrarVindoDe(retorno)).resolves.toBe("/");
  });
});
