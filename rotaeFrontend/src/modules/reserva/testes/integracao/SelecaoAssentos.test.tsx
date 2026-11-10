import { fireEvent, render, screen } from "@testing-library/react";
import { useAutenticacao } from "@/modules/autenticacao/hooks/useAutenticacao";
import { listarViagensAssentos } from "@/modules/viagem-assento/services/listarViagensAssentos";
import type { ViagemAssento } from "@/modules/viagem-assento/types/viagemAssento";
import { buscarViagem } from "@/modules/viagem/services/buscarViagem";
import { SelecaoAssentos } from "../../components/SelecaoAssentos";
import { cancelarReserva } from "../../services/cancelarReserva";
import { criarReserva } from "../../services/criarReserva";
import { criarReservaFalsa } from "../fixtures/reserva";

const push = jest.fn();

jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
jest.mock("@/modules/autenticacao/hooks/useAutenticacao");
jest.mock("@/modules/viagem-assento/services/listarViagensAssentos");
jest.mock("@/modules/viagem/services/buscarViagem");
jest.mock("../../services/cancelarReserva");
jest.mock("../../services/criarReserva");

const viagem = { ...criarReservaFalsa().viagem, partidaEm: "2099-12-18T22:30:00-03:00", chegadaEm: "2099-12-19T04:50:00-03:00", assentosLivres: 40 };

function poltrona(numero: number, status: ViagemAssento["status"]): ViagemAssento {
  return { id: 100 + numero, viagemId: 7, assentoId: numero, numero, status };
}

describe("SelecaoAssentos", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(useAutenticacao).mockReturnValue({ estado: "autenticado" } as ReturnType<typeof useAutenticacao>);
    jest.mocked(buscarViagem).mockResolvedValue(viagem);
    jest.mocked(cancelarReserva).mockResolvedValue(criarReservaFalsa());
  });

  it("mostra como selecionada a poltrona segurada pelo usuário e como ocupada a de outra pessoa", async () => {
    jest.mocked(listarViagensAssentos).mockResolvedValueOnce([poltrona(1, "DISPONIVEL"), poltrona(2, "SEGURADO")]);
    jest.mocked(listarViagensAssentos).mockResolvedValue([poltrona(1, "SEGURADO"), poltrona(2, "SEGURADO")]);
    jest.mocked(criarReserva).mockResolvedValue(criarReservaFalsa({
      id: 9,
      assentos: [{ id: 101, assentoId: 1, numero: 1, status: "SEGURADO" }],
    }));
    render(<SelecaoAssentos viagemId={7} busca={{ origem: "", destino: "", partida: "" }} />);

    expect(await screen.findByRole("button", { name: "Poltrona 2, indisponível" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Poltrona 1, disponível" }));

    expect(await screen.findByRole("button", { name: "Poltrona 1, selecionada" })).toBeEnabled();
    expect(criarReserva).toHaveBeenCalledWith(7, [101]);
  });

  it("mantém a reserva e vai para os passageiros ao confirmar", async () => {
    jest.mocked(listarViagensAssentos).mockResolvedValue([poltrona(1, "DISPONIVEL")]);
    jest.mocked(criarReserva).mockResolvedValue(criarReservaFalsa({
      id: 9,
      assentos: [{ id: 101, assentoId: 1, numero: 1, status: "SEGURADO" }],
    }));
    const { unmount } = render(<SelecaoAssentos viagemId={7} busca={{ origem: "", destino: "", partida: "" }} />);

    fireEvent.click(await screen.findByRole("button", { name: "Poltrona 1, disponível" }));
    await screen.findByRole("button", { name: "Poltrona 1, selecionada" });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar seleção" }));

    expect(push).toHaveBeenCalledWith("/reservas/9/passageiros");
    expect(push).toHaveBeenCalledTimes(1);

    unmount();
    expect(cancelarReserva).not.toHaveBeenCalled();
  });

  it("avisa quando a viagem não está disponível", async () => {
    jest.mocked(buscarViagem).mockResolvedValue({ ...viagem, assentosLivres: 0 });
    render(<SelecaoAssentos viagemId={7} busca={{ origem: "", destino: "", partida: "" }} />);

    expect(await screen.findByRole("status")).toHaveTextContent("Esta viagem não está disponível");
    expect(listarViagensAssentos).not.toHaveBeenCalled();
  });
});
