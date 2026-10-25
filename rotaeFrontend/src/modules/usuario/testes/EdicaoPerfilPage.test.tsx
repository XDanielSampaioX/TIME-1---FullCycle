import { fireEvent, render, screen } from "@testing-library/react";
import { EdicaoPerfilPage } from "../pages/EdicaoPerfilPage";
import type { Usuario } from "../types/usuario";

const useAutenticacao = jest.fn();

jest.mock("next/navigation", () => ({ useRouter: () => ({ replace: jest.fn() }) }));
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

describe("EdicaoPerfilPage", () => {
  it("convida a entrar quando não há sessão", () => {
    useAutenticacao.mockReturnValue({ usuario: null, iniciarSessao: jest.fn(), sair: jest.fn() });
    render(<EdicaoPerfilPage />);

    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/login");
    expect(screen.queryByRole("button", { name: "Salvar alterações" })).not.toBeInTheDocument();
  });

  it("mostra título, formulário e área de segurança para quem está logado", () => {
    useAutenticacao.mockReturnValue({ usuario, iniciarSessao: jest.fn(), sair: jest.fn() });
    render(<EdicaoPerfilPage />);

    expect(screen.getByRole("heading", { name: "Meu perfil" })).toBeInTheDocument();
    expect(screen.getByText("Gerencie suas informações pessoais")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar alterações" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Área de segurança" })).toBeInTheDocument();
  });

  it("Cancelar descarta o que foi digitado e volta aos dados salvos", () => {
    useAutenticacao.mockReturnValue({ usuario, iniciarSessao: jest.fn(), sair: jest.fn() });
    render(<EdicaoPerfilPage />);
    const nome = () => screen.getByLabelText<HTMLInputElement>("Nome completo");

    fireEvent.change(nome(), { target: { value: "Outro nome" } });
    expect(nome()).toHaveValue("Outro nome");

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(nome()).toHaveValue("João Silva");
  });
});
