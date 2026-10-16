import { render, screen } from "@testing-library/react";
import { MinhaContaPage } from "../pages/MinhaContaPage";
import type { Usuario } from "../types/usuario";

const useAutenticacao = jest.fn();

jest.mock("@/modules/autenticacao/hooks/useAutenticacao", () => ({ useAutenticacao: () => useAutenticacao() }));

const usuario: Usuario = {
  id: 1,
  nome: "João Silva",
  email: "joao@email.com",
  celular: "(85) 99999-0000",
  dataNasc: "1995-04-20",
  cpf: "529.982.247-25",
  criadoEm: "2026-10-01T10:00:00Z",
  atualizadoEm: "2026-10-01T10:00:00Z",
};

describe("MinhaContaPage", () => {
  it("convida a entrar quando não há sessão", () => {
    useAutenticacao.mockReturnValue({ usuario: null, iniciarSessao: jest.fn() });
    render(<MinhaContaPage />);

    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/login");
    expect(screen.queryByRole("heading", { name: "Editar dados" })).not.toBeInTheDocument();
  });

  it("mostra perfil, edição de dados e troca de senha para quem está logado", () => {
    useAutenticacao.mockReturnValue({ usuario, iniciarSessao: jest.fn() });
    render(<MinhaContaPage />);

    expect(screen.getByRole("heading", { name: "Perfil" })).toBeInTheDocument();
    expect(screen.getByText("529.982.247-25")).toBeInTheDocument();
    expect(screen.getByText("20/04/1995")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Editar dados" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Alterar senha" })).toBeInTheDocument();
  });
});
