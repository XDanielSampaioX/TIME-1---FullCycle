import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AreaSeguranca } from "../components/AreaSeguranca";
import { useExclusaoConta } from "../hooks/useExclusaoConta";
import { excluirConta } from "../services/excluirConta";

const sair = jest.fn();
const replace = jest.fn();

jest.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
jest.mock("@/modules/autenticacao/hooks/useAutenticacao", () => ({ useAutenticacao: () => ({ sair }) }));
jest.mock("../services/excluirConta");

// A página cria o estado da exclusão e o repassa para a área de segurança.
function Area() {
  const exclusao = useExclusaoConta();

  return <AreaSeguranca exclusao={exclusao} />;
}

describe("AreaSeguranca", () => {
  beforeEach(() => jest.resetAllMocks());

  it("pede confirmação antes de excluir a conta", () => {
    render(<Area />);

    fireEvent.click(screen.getByRole("button", { name: "Excluir minha conta" }));

    expect(screen.getByText(/Tem certeza\?/)).toBeInTheDocument();
    expect(excluirConta).not.toHaveBeenCalled();
  });

  it("volta ao estado inicial ao desistir", () => {
    render(<Area />);

    fireEvent.click(screen.getByRole("button", { name: "Excluir minha conta" }));
    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));

    expect(screen.queryByText(/Tem certeza\?/)).not.toBeInTheDocument();
    expect(excluirConta).not.toHaveBeenCalled();
  });

  it("explica que a conta é desativada e o histórico de viagens é mantido", () => {
    render(<Area />);

    expect(screen.getByText(/Sua conta será desativada/)).toHaveTextContent("O registro das viagens já feitas é mantido.");
  });

  it("leva o foco para Voltar ao confirmar e de volta para Excluir ao cancelar", () => {
    render(<Area />);

    fireEvent.click(screen.getByRole("button", { name: "Excluir minha conta" }));
    expect(screen.getByRole("button", { name: "Voltar" })).toHaveFocus();

    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
    expect(screen.getByRole("button", { name: "Excluir minha conta" })).toHaveFocus();
  });

  it("cancela a confirmação com Esc e devolve o foco", () => {
    render(<Area />);

    fireEvent.click(screen.getByRole("button", { name: "Excluir minha conta" }));
    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByText(/Tem certeza\?/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Excluir minha conta" })).toHaveFocus();
    expect(excluirConta).not.toHaveBeenCalled();
  });

  it("exclui, encerra a sessão e leva para a página inicial", async () => {
    jest.mocked(excluirConta).mockResolvedValue(undefined);
    render(<Area />);

    fireEvent.click(screen.getByRole("button", { name: "Excluir minha conta" }));
    fireEvent.click(screen.getByRole("button", { name: "Sim, excluir minha conta" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    expect(sair).toHaveBeenCalledTimes(1);
    // Navega primeiro e só depois encerra a sessão.
    expect(replace.mock.invocationCallOrder[0]).toBeLessThan(sair.mock.invocationCallOrder[0]);
  });

  it("mantém a sessão e avisa quando a exclusão falha", async () => {
    jest.mocked(excluirConta).mockRejectedValue(new Error("falha"));
    render(<Area />);

    fireEvent.click(screen.getByRole("button", { name: "Excluir minha conta" }));
    fireEvent.click(screen.getByRole("button", { name: "Sim, excluir minha conta" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível excluir a conta.");
    expect(sair).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });
});
