import { act, renderHook, waitFor } from "@testing-library/react";
import { useCarregarDados } from "../../hooks/useCarregarDados";

const MENSAGEM = "Não foi possível carregar.";

describe("useCarregarDados", () => {
  it("carrega os dados e busca de novo quando o parâmetro muda", async () => {
    const buscar = jest.fn((id: number) => Promise.resolve(`dados ${id}`));
    const { result, rerender } = renderHook(({ id }) => useCarregarDados(buscar, id, MENSAGEM), { initialProps: { id: 1 } });

    expect(result.current.carregando).toBe(true);
    await waitFor(() => expect(result.current.dados).toBe("dados 1"));
    expect(result.current.carregando).toBe(false);

    rerender({ id: 2 });

    await waitFor(() => expect(result.current.dados).toBe("dados 2"));
  });

  it("mostra o erro quando a primeira busca falha", async () => {
    const buscar = jest.fn((): Promise<string> => Promise.reject(new Error("falhou")));
    const { result } = renderHook(() => useCarregarDados(buscar, undefined, MENSAGEM));

    await waitFor(() => expect(result.current.erro).toBe(MENSAGEM));
    expect(result.current.dados).toBeNull();
    expect(result.current.carregando).toBe(false);
  });

  it("mantém os dados anteriores enquanto recarrega e quando a nova busca falha", async () => {
    const buscar = jest.fn((): Promise<string> => Promise.resolve("primeira"));
    const { result } = renderHook(() => useCarregarDados(buscar, undefined, MENSAGEM));
    await waitFor(() => expect(result.current.dados).toBe("primeira"));

    buscar.mockRejectedValueOnce(new Error("falhou"));
    act(() => result.current.recarregar());

    expect(result.current.carregando).toBe(true);
    expect(result.current.dados).toBe("primeira");
    await waitFor(() => expect(result.current.erro).toBe(MENSAGEM));
    expect(result.current.dados).toBe("primeira");
  });

  it("limpa o erro ao tentar novamente", async () => {
    const buscar = jest.fn((): Promise<string> => Promise.reject(new Error("falhou")));
    const { result } = renderHook(() => useCarregarDados(buscar, undefined, MENSAGEM));
    await waitFor(() => expect(result.current.erro).toBe(MENSAGEM));

    buscar.mockResolvedValueOnce("recuperou");
    act(() => result.current.recarregar());

    expect(result.current.erro).toBeNull();
    await waitFor(() => expect(result.current.dados).toBe("recuperou"));
  });

  it("ignora a resposta de uma busca substituída", async () => {
    const pendentes: ((valor: string) => void)[] = [];
    const buscar = jest.fn(() => new Promise<string>((resolver) => pendentes.push(resolver)));
    const { result } = renderHook(() => useCarregarDados(buscar, undefined, MENSAGEM));

    act(() => result.current.recarregar());
    await waitFor(() => expect(pendentes).toHaveLength(2));

    await act(async () => pendentes[1]("nova"));
    await act(async () => pendentes[0]("antiga"));

    expect(result.current.dados).toBe("nova");
  });
});
