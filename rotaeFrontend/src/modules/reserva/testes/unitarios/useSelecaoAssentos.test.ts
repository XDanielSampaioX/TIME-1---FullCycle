import { act, renderHook } from "@testing-library/react";
import { useAutenticacao } from "@/modules/autenticacao/hooks/useAutenticacao";
import type { ViagemAssento } from "@/modules/viagem-assento/types/viagemAssento";
import { cancelarReserva } from "../../services/cancelarReserva";
import { criarReserva } from "../../services/criarReserva";
import { criarReservaFalsa } from "../fixtures/reserva";
import { useSelecaoAssentos } from "../../hooks/useSelecaoAssentos";

const push = jest.fn();

jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
jest.mock("@/modules/autenticacao/hooks/useAutenticacao");
jest.mock("../../services/cancelarReserva");
jest.mock("../../services/criarReserva");

// O id da poltrona na viagem (100 + número) é diferente do assentoId, como no backend.
const mapa: ViagemAssento[] = Array.from({ length: 12 }, (_, indice) => ({
  id: 101 + indice,
  viagemId: 7,
  assentoId: 1 + indice,
  numero: 1 + indice,
  status: "DISPONIVEL",
}));

function reservaCom(id: number, assentoIds: number[]) {
  return criarReservaFalsa({
    id,
    assentos: assentoIds.map((assentoId) => ({ id: 100 + assentoId, assentoId, numero: assentoId, status: "SEGURADO" })),
  });
}

function montar() {
  const atualizarMapa = jest.fn();
  return { atualizarMapa, ...renderHook(() => useSelecaoAssentos(7, mapa, atualizarMapa)) };
}

describe("useSelecaoAssentos", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(useAutenticacao).mockReturnValue({ estado: "autenticado" } as ReturnType<typeof useAutenticacao>);
    jest.mocked(cancelarReserva).mockResolvedValue(criarReservaFalsa());
  });

  it("segura a poltrona no backend assim que ela é selecionada", async () => {
    jest.mocked(criarReserva).mockResolvedValue(reservaCom(1, [5]));
    const { result, atualizarMapa } = montar();

    await act(() => result.current.alternar(5));

    expect(criarReserva).toHaveBeenCalledWith(7, [105]);
    expect(result.current.selecionados).toEqual([5]);
    expect(atualizarMapa).toHaveBeenCalled();
  });

  it("refaz a reserva ao adicionar outra poltrona", async () => {
    jest.mocked(criarReserva)
      .mockResolvedValueOnce(reservaCom(1, [5]))
      .mockResolvedValueOnce(reservaCom(2, [5, 6]));
    const { result } = montar();

    await act(() => result.current.alternar(5));
    await act(() => result.current.alternar(6));

    expect(cancelarReserva).toHaveBeenCalledWith(1);
    expect(criarReserva).toHaveBeenLastCalledWith(7, [105, 106]);
    expect(result.current.selecionados).toEqual([5, 6]);
  });

  it("libera a poltrona ao desmarcar a última", async () => {
    jest.mocked(criarReserva).mockResolvedValue(reservaCom(1, [5]));
    const { result } = montar();

    await act(() => result.current.alternar(5));
    await act(() => result.current.alternar(5));

    expect(cancelarReserva).toHaveBeenCalledWith(1);
    expect(criarReserva).toHaveBeenCalledTimes(1);
    expect(result.current.selecionados).toEqual([]);
  });

  it("mantém as outras poltronas quando uma foi ocupada por outra pessoa", async () => {
    jest.mocked(criarReserva)
      .mockResolvedValueOnce(reservaCom(1, [5]))
      .mockResolvedValueOnce([106])
      .mockResolvedValueOnce(reservaCom(2, [5]));
    const { result } = montar();

    await act(() => result.current.alternar(5));
    await act(() => result.current.alternar(6));

    expect(criarReserva).toHaveBeenLastCalledWith(7, [105]);
    expect(result.current.selecionados).toEqual([5]);
    expect(result.current.erro).toBe("Outra pessoa acabou de escolher essa poltrona. Escolha outra.");
  });

  it("não aceita mais poltronas depois do limite do backend e avisa", async () => {
    jest.mocked(criarReserva).mockResolvedValue(reservaCom(1, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
    const { result } = montar();

    await act(() => result.current.alternar(1));
    await act(() => result.current.alternar(11));

    expect(criarReserva).toHaveBeenCalledTimes(1);
    expect(cancelarReserva).not.toHaveBeenCalled();
    expect(result.current.selecionados).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(result.current.erro).toBe("Você pode reservar até 10 poltronas.");
  });

  it("devolve as poltronas ao sair da tela sem confirmar", async () => {
    jest.mocked(criarReserva).mockResolvedValue(reservaCom(1, [5]));
    const { result, unmount } = montar();

    await act(() => result.current.alternar(5));
    unmount();

    expect(cancelarReserva).toHaveBeenCalledWith(1, { keepalive: true });
  });

  it("mantém a reserva e vai para os passageiros ao confirmar", async () => {
    jest.mocked(criarReserva).mockResolvedValue(reservaCom(1, [5]));
    const { result, unmount } = montar();

    await act(() => result.current.alternar(5));
    await act(async () => {
      await expect(result.current.confirmar()).resolves.toBe(false);
    });
    unmount();

    expect(push).toHaveBeenCalledWith("/reservas/1/passageiros");
    expect(cancelarReserva).not.toHaveBeenCalled();
  });

  it("não sai da tela ao confirmar sem nenhuma poltrona", async () => {
    const { result } = montar();

    await act(async () => {
      await result.current.confirmar();
    });

    expect(push).not.toHaveBeenCalled();
  });

  it("leva para o login quem não está autenticado", async () => {
    jest.mocked(useAutenticacao).mockReturnValue({ estado: "anonimo" } as ReturnType<typeof useAutenticacao>);
    const { result } = montar();

    await act(() => result.current.alternar(5));

    expect(criarReserva).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/login");
  });
});
