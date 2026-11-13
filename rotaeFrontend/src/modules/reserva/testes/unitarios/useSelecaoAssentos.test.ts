import { act, renderHook } from "@testing-library/react";
import { useAutenticacao } from "@/modules/autenticacao/hooks/useAutenticacao";
import type { ViagemAssento } from "@/modules/viagem-assento/types/viagemAssento";
import { criarReserva } from "../../services/criarReserva";
import { criarReservaFalsa } from "../fixtures/reserva";
import { useSelecaoAssentos } from "../../hooks/useSelecaoAssentos";

const push = jest.fn();
let busca = new URLSearchParams();

jest.mock("next/navigation", () => ({ useRouter: () => ({ push }), useSearchParams: () => busca }));
jest.mock("@/modules/autenticacao/hooks/useAutenticacao");
jest.mock("../../services/criarReserva");

// O id da poltrona na viagem (100 + número) é o que a seleção guarda e o que o POST /reservas/ recebe.
const mapa: ViagemAssento[] = Array.from({ length: 12 }, (_, indice) => ({
  id: 101 + indice,
  viagemId: 7,
  numero: 1 + indice,
  status: "DISPONIVEL",
}));

function montar(assentos = mapa) {
  const atualizarMapa = jest.fn();
  return { atualizarMapa, ...renderHook(() => useSelecaoAssentos(7, assentos, atualizarMapa)) };
}

describe("useSelecaoAssentos", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    busca = new URLSearchParams();
    jest.mocked(useAutenticacao).mockReturnValue({ estado: "autenticado" } as ReturnType<typeof useAutenticacao>);
  });

  it("seleciona e desmarca poltronas sem chamar o backend", () => {
    const { result } = montar();

    act(() => result.current.alternar(105));
    act(() => result.current.alternar(106));
    act(() => result.current.alternar(105));

    expect(result.current.selecionados).toEqual([106]);
    expect(criarReserva).not.toHaveBeenCalled();
  });

  it("não seleciona poltrona ocupada", () => {
    const { result } = montar([{ ...mapa[0], status: "SEGURADO" }]);

    act(() => result.current.alternar(101));

    expect(result.current.selecionados).toEqual([]);
  });

  it("não aceita mais poltronas depois do limite do backend e avisa", () => {
    const { result } = montar();

    for (let id = 101; id <= 111; id += 1) act(() => result.current.alternar(id));

    expect(result.current.selecionados).toHaveLength(10);
    expect(result.current.erro).toBe("Você pode reservar até 10 poltronas.");
  });

  it("cria a reserva só ao confirmar e vai para os passageiros", async () => {
    jest.mocked(criarReserva).mockResolvedValue(criarReservaFalsa({ id: 1 }));
    const { result } = montar();

    act(() => result.current.alternar(105));
    act(() => result.current.alternar(106));
    await act(async () => {
      await expect(result.current.confirmar()).resolves.toBe(false);
    });

    expect(criarReserva).toHaveBeenCalledTimes(1);
    expect(criarReserva).toHaveBeenCalledWith(7, [105, 106]);
    expect(push).toHaveBeenCalledWith("/reservas/1/passageiros");
  });

  it("tira da seleção as poltronas que outra pessoa ocupou, avisa e atualiza o mapa", async () => {
    jest.mocked(criarReserva).mockResolvedValue([106]);
    const { result, atualizarMapa } = montar();

    act(() => result.current.alternar(105));
    act(() => result.current.alternar(106));
    await act(() => result.current.confirmar());

    expect(result.current.selecionados).toEqual([105]);
    expect(result.current.erro).toBe("Outra pessoa acabou de escolher uma das poltronas. Escolha outra.");
    expect(atualizarMapa).toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("mostra o erro do backend quando a reserva falha", async () => {
    jest.mocked(criarReserva).mockRejectedValue(new Error("Não foi possível reservar as poltronas."));
    const { result } = montar();

    act(() => result.current.alternar(105));
    await act(() => result.current.confirmar());

    expect(result.current.erro).toBe("Não foi possível reservar as poltronas.");
    expect(result.current.verificando).toBe(false);
  });

  it("não sai da tela ao confirmar sem nenhuma poltrona", async () => {
    const { result } = montar();

    await act(() => result.current.confirmar());

    expect(criarReserva).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("deixa quem não está autenticado escolher e só pede o login ao confirmar, com a volta para esta tela", async () => {
    jest.mocked(useAutenticacao).mockReturnValue({ estado: "anonimo" } as ReturnType<typeof useAutenticacao>);
    window.history.replaceState(null, "", "/viagens/7/assentos?origem=1&destino=2");
    const { result } = montar();

    act(() => result.current.alternar(105));
    act(() => result.current.alternar(106));
    expect(push).not.toHaveBeenCalled();

    await act(() => result.current.confirmar());

    expect(criarReserva).not.toHaveBeenCalled();
    const destino = new URL(push.mock.calls[0][0], "http://localhost");
    expect(destino.pathname).toBe("/login");
    expect(destino.searchParams.get("retorno")).toBe("/viagens/7/assentos?origem=1&destino=2&assentos=105%2C106");
  });

  it("recupera a seleção que voltou do login", () => {
    busca = new URLSearchParams("assentos=105,106");
    const { result } = montar();

    expect(result.current.selecionados).toEqual([105, 106]);
  });

  it("descarta da seleção vinda da URL os ids repetidos, os que não são desta viagem e os além do limite", () => {
    busca = new URLSearchParams("assentos=105,105,999,101,102,103,104,106,107,108,109,110,111");
    const { result } = montar();

    expect(result.current.selecionados).toEqual([105, 101, 102, 103, 104, 106, 107, 108, 109, 110]);
  });
});
