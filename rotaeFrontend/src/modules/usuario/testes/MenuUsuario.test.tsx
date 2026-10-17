import { fireEvent, render, screen } from "@testing-library/react";
import { MenuUsuario } from "../components/MenuUsuario";
import type { Usuario } from "../types/usuario";

const usuario: Usuario = {
  id: 1,
  nome: "Snow",
  email: "snow@email.com",
  celular: "(85) 99999-0000",
  dataNasc: "1995-04-20",
  cpf: "529.982.247-25",
  criadoEm: "2026-10-01T10:00:00Z",
  atualizadoEm: "2026-10-01T10:00:00Z",
};

function menuAberto() {
  const menu = document.querySelector("details")!;
  menu.open = true;
  return menu;
}

describe("MenuUsuario", () => {
  it("mostra só um indicador de carregamento enquanto a sessão é lida", () => {
    render(<MenuUsuario estado="carregando" usuario={null} sessaoIndisponivel={false} aoSair={jest.fn()} />);

    expect(screen.getByRole("status")).toHaveTextContent("Carregando sessão...");
    expect(screen.queryByRole("link", { name: "Entrar" })).not.toBeInTheDocument();
  });

  it("oferece login e cadastro no estado anônimo", () => {
    render(<MenuUsuario estado="anonimo" usuario={null} sessaoIndisponivel={false} aoSair={jest.fn()} />);

    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute("href", "/cadastro");
    expect(screen.queryByRole("button", { name: "Sair" })).not.toBeInTheDocument();
  });

  it("oferece minhas viagens, editar perfil e sair no estado autenticado", () => {
    const aoSair = jest.fn();
    render(<MenuUsuario estado="autenticado" usuario={usuario} sessaoIndisponivel={false} aoSair={aoSair} />);

    expect(screen.getByRole("link", { name: "Minhas viagens" })).toHaveAttribute("href", "/reservas");
    expect(screen.getByRole("link", { name: "Editar perfil" })).toHaveAttribute("href", "/editar-perfil");
    expect(screen.queryByRole("link", { name: "Entrar" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Sair" }));
    expect(aoSair).toHaveBeenCalledTimes(1);
  });

  it("avisa quando a sessão está indisponível, sem tirar o acesso do usuário", () => {
    render(<MenuUsuario estado="autenticado" usuario={usuario} sessaoIndisponivel aoSair={jest.fn()} />);

    expect(screen.getByRole("status")).toHaveTextContent("Não foi possível confirmar sua sessão");
    expect(screen.getByLabelText("Menu da conta (sessão indisponível)")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Editar perfil" })).toBeInTheDocument();
  });

  it("fecha com Esc, clique fora ou escolha de um link", () => {
    render(<MenuUsuario estado="anonimo" usuario={null} sessaoIndisponivel={false} aoSair={jest.fn()} />);
    const menu = menuAberto();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(menu.open).toBe(false);

    menu.open = true;
    fireEvent.pointerDown(document.body);
    expect(menu.open).toBe(false);

    menu.open = true;
    fireEvent.click(screen.getByRole("link", { name: "Entrar" }));
    expect(menu.open).toBe(false);
  });

  it("não fecha ao clicar dentro do menu", () => {
    render(<MenuUsuario estado="anonimo" usuario={null} sessaoIndisponivel={false} aoSair={jest.fn()} />);
    const menu = menuAberto();

    fireEvent.pointerDown(screen.getByRole("link", { name: "Criar conta" }));
    expect(menu.open).toBe(true);
  });
});
