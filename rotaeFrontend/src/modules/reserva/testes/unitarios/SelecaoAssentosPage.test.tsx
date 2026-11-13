import { render, screen } from "@testing-library/react";
import { SelecaoAssentosPage } from "../../pages/SelecaoAssentosPage";

// O conteúdo da seleção tem teste próprio; aqui só importa o que a página monta em volta dele.
jest.mock("../../components/SelecaoAssentos", () => ({
  SelecaoAssentos: ({ viagemId }: { viagemId: number }) => <p>Mapa da viagem {viagemId}</p>,
}));

describe("SelecaoAssentosPage", () => {
  it("marca a etapa de seleção e mostra o conteúdo da viagem", () => {
    render(<SelecaoAssentosPage viagemId={7} busca={{ origem: "1", destino: "2", partida: "2026-12-18" }} />);

    expect(screen.getByRole("navigation", { name: "Etapas do checkout" })).toBeInTheDocument();
    expect(screen.getByText("Seleção de assentos").closest("li")).toHaveAttribute("aria-current", "step");
    expect(screen.getByText("Mapa da viagem 7")).toBeInTheDocument();
  });

  it("volta para os resultados com a mesma busca", () => {
    render(<SelecaoAssentosPage viagemId={7} busca={{ origem: "1", destino: "2", partida: "2026-12-18" }} />);

    expect(screen.getByRole("link", { name: "← Voltar aos resultados" }))
      .toHaveAttribute("href", "/viagens?origem=1&destino=2&partida=2026-12-18");
  });

  it("mantém a quantidade de passageiros quando ela fez parte da busca", () => {
    render(<SelecaoAssentosPage viagemId={7} busca={{ origem: "1", destino: "2", partida: "2026-12-18", passageiros: 3 }} />);

    expect(screen.getByRole("link", { name: "← Voltar aos resultados" }))
      .toHaveAttribute("href", "/viagens?origem=1&destino=2&partida=2026-12-18&passageiros=3");
  });
});
