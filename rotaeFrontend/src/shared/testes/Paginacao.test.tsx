import { render, screen } from "@testing-library/react";
import { Paginacao } from "../components/Paginacao";

describe("Paginacao", () => {
  it("desabilita Anterior na primeira página e Próxima na última", () => {
    const { rerender } = render(
      <Paginacao resumo="1 de 2" anterior={null} proxima="2" onNavegar={jest.fn()} />,
    );
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Próxima" })).toBeEnabled();

    rerender(<Paginacao resumo="2 de 2" anterior="1" proxima={null} onNavegar={jest.fn()} />);
    expect(screen.getByRole("button", { name: "Anterior" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Próxima" })).toBeDisabled();
  });

  it("usa o rótulo informado", () => {
    render(
      <Paginacao
        rotulo="Passagens da reserva"
        resumo="1 de 2"
        anterior={null}
        proxima="2"
        onNavegar={jest.fn()}
      />,
    );
    expect(screen.getByRole("navigation", { name: "Passagens da reserva" })).toBeInTheDocument();
  });

  it("mostra Anterior, o resumo e Próxima numa linha, nessa ordem", () => {
    render(<Paginacao resumo="Página 1 de 3" anterior={null} proxima="2" onNavegar={jest.fn()} />);

    const navegacao = screen.getByRole("navigation", { name: "Paginação dos resultados" });
    expect([...navegacao.children].map((filho) => filho.textContent?.replace(/[‹›]/g, "").trim())).toEqual([
      "Anterior",
      "Página 1 de 3",
      "Próxima",
    ]);
  });

  it("acrescenta a classe informada sem perder a padrão", () => {
    render(<Paginacao className="extra" resumo="1 de 2" anterior={null} proxima="2" onNavegar={jest.fn()} />);

    const navegacao = screen.getByRole("navigation", { name: "Paginação dos resultados" });
    expect(navegacao).toHaveClass("extra");
    expect(navegacao.classList.length).toBe(2);
  });
});
