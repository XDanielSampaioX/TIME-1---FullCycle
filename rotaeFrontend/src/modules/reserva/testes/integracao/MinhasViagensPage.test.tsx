import { fireEvent, render, screen } from "@testing-library/react";
import { MinhasViagensPage } from "../../pages/MinhasViagensPage";
import { buscarReserva } from "../../services/buscarReserva";
import { listarMinhasReservas } from "../../services/listarMinhasReservas";
import { criarReservaFalsa } from "../fixtures/reserva";

const useAutenticacao = jest.fn();

jest.mock("@/modules/autenticacao/hooks/useAutenticacao", () => ({ useAutenticacao: () => useAutenticacao() }));
jest.mock("../../services/buscarReserva");
jest.mock("../../services/listarMinhasReservas");

// Página, conteúdo, lista e cartões juntos. Só a API fica de fora.
describe("MinhasViagensPage", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useAutenticacao.mockReturnValue({ estado: "autenticado" });
    jest.mocked(buscarReserva).mockResolvedValue({ ...criarReservaFalsa(), passageiros: [] });
  });

  it("pede login a quem não está autenticado e não busca reservas", () => {
    useAutenticacao.mockReturnValue({ estado: "anonimo" });
    render(<MinhasViagensPage />);

    expect(screen.getByText("Entre na sua conta para ver suas reservas.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/login");
    expect(listarMinhasReservas).not.toHaveBeenCalled();
  });

  it("não mostra nada enquanto a sessão está sendo verificada", () => {
    useAutenticacao.mockReturnValue({ estado: "carregando" });
    render(<MinhasViagensPage />);

    expect(screen.getByRole("heading", { name: "Minhas viagens" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Entrar" })).not.toBeInTheDocument();
    expect(listarMinhasReservas).not.toHaveBeenCalled();
  });

  it("mostra o carregamento e depois as reservas do usuário", async () => {
    jest.mocked(listarMinhasReservas).mockResolvedValue([criarReservaFalsa()]);
    render(<MinhasViagensPage />);

    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    expect(await screen.findByRole("article", { name: "Reserva #ROT-2026-5087" })).toBeInTheDocument();
  });

  it("avisa quando o usuário ainda não tem reservas", async () => {
    jest.mocked(listarMinhasReservas).mockResolvedValue([]);
    render(<MinhasViagensPage />);

    expect(await screen.findByRole("heading", { name: "Você ainda não tem reservas" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Encontrar viagem" })).toHaveAttribute("href", "/#buscar");
  });

  it("mostra o erro e carrega de novo ao tentar novamente", async () => {
    jest.mocked(listarMinhasReservas)
      .mockRejectedValueOnce(new Error("falha de rede"))
      .mockResolvedValue([criarReservaFalsa()]);
    render(<MinhasViagensPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível carregar suas reservas.");

    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await screen.findByRole("article", { name: "Reserva #ROT-2026-5087" })).toBeInTheDocument();
    expect(listarMinhasReservas).toHaveBeenCalledTimes(2);
  });
});
