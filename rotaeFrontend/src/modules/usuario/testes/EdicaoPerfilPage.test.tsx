import { fireEvent, render, screen } from "@testing-library/react";
import { EdicaoPerfilPage } from "../pages/EdicaoPerfilPage";
import { excluirConta } from "../services/excluirConta";
import { usuario } from "./fixtures/usuario";

const useAutenticacao = jest.fn();

jest.mock("next/navigation", () => ({ useRouter: () => ({ replace: jest.fn() }) }));
jest.mock("@/modules/autenticacao/hooks/useAutenticacao", () => ({ useAutenticacao: () => useAutenticacao() }));
jest.mock("../services/excluirConta");

const funcoes = { iniciarSessao: jest.fn(), atualizarSessao: jest.fn(), sair: jest.fn() };

describe("EdicaoPerfilPage", () => {
  beforeEach(() => jest.resetAllMocks());

  it("não mostra nada enquanto a sessão está sendo lida", () => {
    useAutenticacao.mockReturnValue({ usuario: null, estado: "carregando", sessaoIndisponivel: false, ...funcoes });
    render(<EdicaoPerfilPage />);

    expect(screen.queryByRole("link", { name: "Entrar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Salvar alterações" })).not.toBeInTheDocument();
  });

  it("convida a entrar quando não há sessão", () => {
    useAutenticacao.mockReturnValue({ usuario: null, estado: "anonimo", sessaoIndisponivel: false, ...funcoes });
    render(<EdicaoPerfilPage />);

    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/login");
    expect(screen.queryByRole("button", { name: "Salvar alterações" })).not.toBeInTheDocument();
  });

  it("mostra título, formulário e área de segurança para quem está logado", () => {
    useAutenticacao.mockReturnValue({ usuario, estado: "autenticado", sessaoIndisponivel: false, ...funcoes });
    render(<EdicaoPerfilPage />);

    expect(screen.getByRole("heading", { name: "Meu perfil" })).toBeInTheDocument();
    expect(screen.getByText("Gerencie suas informações pessoais")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar alterações" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Área de segurança" })).toBeInTheDocument();
  });

  it("Cancelar descarta o que foi digitado e volta aos dados salvos", () => {
    useAutenticacao.mockReturnValue({ usuario, estado: "autenticado", sessaoIndisponivel: false, ...funcoes });
    render(<EdicaoPerfilPage />);
    const nome = () => screen.getByLabelText<HTMLInputElement>("Nome completo");

    fireEvent.change(nome(), { target: { value: "Outro nome" } });
    expect(nome()).toHaveValue("Outro nome");

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(nome()).toHaveValue("João Silva");
  });

  it("não mostra a tela de visitante enquanto a conta excluída sai da página", async () => {
    const anonimo = { usuario: null, estado: "anonimo", sessaoIndisponivel: false };
    // Como no app: sair() encerra a sessão na hora, antes de a rota mudar.
    const sair: jest.Mock = jest.fn(() => useAutenticacao.mockReturnValue({ ...anonimo, ...funcoes, sair }));
    useAutenticacao.mockReturnValue({ usuario, estado: "autenticado", sessaoIndisponivel: false, ...funcoes, sair });
    jest.mocked(excluirConta).mockResolvedValue(undefined);
    render(<EdicaoPerfilPage />);

    fireEvent.click(screen.getByRole("button", { name: "Excluir minha conta" }));
    fireEvent.click(screen.getByRole("button", { name: "Sim, excluir minha conta" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Conta desativada");
    expect(sair).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/Entre na sua conta/)).not.toBeInTheDocument();
  });
});
