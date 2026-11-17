import { act, renderHook } from "@testing-library/react";
import { useAutenticacao } from "../hooks/useAutenticacao";
import { useLogin } from "../hooks/useLogin";
import { entrar } from "../services/entrar";
import { caminhoDoLogin, destinoAposLogin } from "../utils/destinoAposLogin";

const replace = jest.fn();

jest.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
jest.mock("../hooks/useAutenticacao");
jest.mock("../services/entrar");

// Faz o mesmo caminho da tela: o link do login leva ?voltar=, a página (app/(auth)/login) valida
// com destinoAposLogin e o useLogin recebe o destino pronto.
async function entrarVindoDe(link: string) {
  const voltar = new URL(link, "http://localhost").searchParams.get("voltar") ?? undefined;
  const { result } = renderHook(() => useLogin(destinoAposLogin(voltar)));

  act(() => result.current.alterarCampo("email", "joao@email.com"));
  act(() => result.current.alterarCampo("senha", "senha-forte-123"));
  await act(() => result.current.enviar());

  return replace.mock.calls[0][0];
}

describe("useLogin", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(useAutenticacao).mockReturnValue({ iniciarSessao: jest.fn() } as unknown as ReturnType<typeof useAutenticacao>);
    jest.mocked(entrar).mockResolvedValue({ sessao: {} } as Awaited<ReturnType<typeof entrar>>);
  });

  it("volta para a tela que mandou para o login, com as poltronas escolhidas", async () => {
    await expect(entrarVindoDe(caminhoDoLogin("/viagens/7/assentos?origem=1&assentos=101,102"))).resolves
      .toBe("/viagens/7/assentos?origem=1&assentos=101,102");
  });

  it("vai para o início sem ?voltar=", async () => {
    await expect(entrarVindoDe("/login")).resolves.toBe("/");
  });

  it.each(["//evil.com", "/\\evil.com", "/\t/evil.com", "https://evil.com", "/.//evil.com"])(
    "não sai do site com ?voltar=%j",
    async (voltar) => {
      await expect(entrarVindoDe(caminhoDoLogin(voltar))).resolves.toBe("/");
    },
  );
});
