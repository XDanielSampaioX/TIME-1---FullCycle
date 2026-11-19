import { fireEvent, render, screen } from "@testing-library/react";
import { CarrosselPassagens } from "../../components/CarrosselPassagens";
import { buscarPassagem } from "../../services/buscarPassagem";
import type { Passagem } from "../../types/passagem";
import type { PassagemResumo } from "../../types/passagemResumo";
import { criarPassagemFalsa } from "../fixtures/passagem";

jest.mock("../../services/buscarPassagem");

const resumos: PassagemResumo[] = [
  { id: 12, viagemAssentoId: 45, passageiroId: 1, status: "CONFIRMADO" },
  { id: 13, viagemAssentoId: 46, passageiroId: 2, status: "CONFIRMADO" },
];
const primeira = criarPassagemFalsa();
const segunda = criarPassagemFalsa({
  id: 13,
  viagemAssento: { id: 46, numero: 46 },
  passageiro: { ...primeira.passageiro, id: 2, nome: "Pedro Souza" },
});

describe("CarrosselPassagens", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(buscarPassagem).mockImplementation(async (id) => (id === 12 ? primeira : segunda));
  });

  it("mostra a primeira passagem e navega para a próxima", async () => {
    render(<CarrosselPassagens passagens={resumos} />);

    expect(await screen.findByText("Mariana Oliveira")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "QR Code da passagem #ROT-2026-0012" })).toBeInTheDocument();
    expect(screen.getByText("Passagem 1 de 2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Próxima" }));

    expect(await screen.findByText("Pedro Souza")).toBeInTheDocument();
    expect(screen.getByText("46")).toBeInTheDocument();
    expect(screen.getByText("Passagem 2 de 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Próxima" })).toBeDisabled();
  });

  it("mostra primeiro a passagem de menor id, mesmo com os resumos em ordem inversa", async () => {
    render(<CarrosselPassagens passagens={[resumos[1], resumos[0]]} />);

    expect(await screen.findByText("Mariana Oliveira")).toBeInTheDocument();
    expect(buscarPassagem).toHaveBeenCalledWith(12);

    fireEvent.click(screen.getByRole("button", { name: "Próxima" }));

    expect(await screen.findByText("Pedro Souza")).toBeInTheDocument();
    expect(buscarPassagem).toHaveBeenLastCalledWith(13);
  });

  it("não mostra classe nem valor no bilhete pago", async () => {
    render(<CarrosselPassagens passagens={resumos} />);

    await screen.findByText("Mariana Oliveira");
    expect(screen.queryByText("CLASSE")).not.toBeInTheDocument();
    expect(screen.queryByText(/VALOR/)).not.toBeInTheDocument();
  });

  it("não deixa o bilhete anterior na tela enquanto a próxima passagem carrega", async () => {
    jest.mocked(buscarPassagem).mockImplementation((id) => (id === 12 ? Promise.resolve(primeira) : new Promise<Passagem>(() => {})));
    render(<CarrosselPassagens passagens={resumos} />);

    await screen.findByText("Mariana Oliveira");
    fireEvent.click(screen.getByRole("button", { name: "Próxima" }));

    expect(screen.queryByText("Mariana Oliveira")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Carregando bilhete");
  });

  it("mostra erro só da passagem que falhou", async () => {
    jest.mocked(buscarPassagem).mockRejectedValueOnce(new Error("falhou")).mockResolvedValue(primeira);
    render(<CarrosselPassagens passagens={resumos} />);

    fireEvent.click(await screen.findByRole("button", { name: "Tentar novamente" }));

    expect(await screen.findByText("Mariana Oliveira")).toBeInTheDocument();
    expect(buscarPassagem).toHaveBeenCalledTimes(2);
    expect(buscarPassagem).toHaveBeenLastCalledWith(12);
  });

  it("o erro de uma passagem fica na página dela", async () => {
    jest.mocked(buscarPassagem).mockImplementation(async (id) => {
      if (id === 12) throw new Error("falhou");
      return segunda;
    });
    render(<CarrosselPassagens passagens={resumos} />);

    expect(await screen.findByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Próxima" }));

    expect(await screen.findByText("Pedro Souza")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tentar novamente" })).not.toBeInTheDocument();
    expect(buscarPassagem).toHaveBeenLastCalledWith(13);
  });

  it("sem navegação com uma passagem só", async () => {
    render(<CarrosselPassagens passagens={[resumos[0]]} />);

    await screen.findByText("Mariana Oliveira");
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("passagem cancelada não mostra QR de embarque", async () => {
    jest.mocked(buscarPassagem).mockResolvedValue({ ...primeira, status: "CANCELADO" });
    render(<CarrosselPassagens passagens={[resumos[0]]} />);

    expect(await screen.findByText("Passagem cancelada")).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /QR Code/ })).not.toBeInTheDocument();
  });

  it("estado vazio", () => {
    render(<CarrosselPassagens passagens={[]} />);

    expect(screen.getByText("Nenhuma passagem emitida para esta reserva.")).toBeInTheDocument();
    expect(buscarPassagem).not.toHaveBeenCalled();
  });
});
