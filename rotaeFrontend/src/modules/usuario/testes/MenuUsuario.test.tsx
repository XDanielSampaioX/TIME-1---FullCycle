import { fireEvent, render, screen } from "@testing-library/react";
import { MenuUsuario } from "../components/MenuUsuario";

const useAutenticacao = jest.fn();

jest.mock("@/modules/autenticacao/hooks/useAutenticacao", () => ({ useAutenticacao: () => useAutenticacao() }));

type Sessao = { estado: "carregando" | "anonimo" | "autenticado"; sessaoIndisponivel: boolean };

function renderizar({ estado, sessaoIndisponivel = false }: { estado: Sessao["estado"]; sessaoIndisponivel?: boolean }) {
  const sair = jest.fn();
  useAutenticacao.mockReturnValue({ estado, sessaoIndisponivel, sair });
  render(<MenuUsuario />);

  return { sair };
}

function menuAberto() {
  const menu = document.querySelector("details")!;
  menu.open = true;
  return menu;
}

describe("MenuUsuario", () => {
  it("mostra só um indicador de carregamento enquanto a sessão é lida", () => {
    renderizar({ estado: "carregando" });

    expect(screen.getByRole("status")).toHaveTextContent("Carregando sessão...");
    expect(screen.queryByRole("link", { name: "Entrar" })).not.toBeInTheDocument();
  });

  it("oferece login e cadastro no estado anônimo", () => {
    renderizar({ estado: "anonimo" });

    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute("href", "/cadastro");
    expect(screen.queryByRole("button", { name: "Sair" })).not.toBeInTheDocument();
  });

  it("oferece editar perfil e sair no estado autenticado, sem link para rota inexistente", () => {
    const { sair } = renderizar({ estado: "autenticado" });

    expect(screen.queryByRole("link", { name: "Minhas viagens" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Editar perfil" })).toHaveAttribute("href", "/editar-perfil");
    expect(screen.queryByRole("link", { name: "Entrar" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Sair" }));
    expect(sair).toHaveBeenCalledTimes(1);
  });

  it("avisa quando a sessão está indisponível, sem tirar o acesso do usuário", () => {
    renderizar({ estado: "autenticado", sessaoIndisponivel: true });

    expect(screen.getByRole("status")).toHaveTextContent("Não foi possível confirmar sua sessão");
    expect(screen.getByLabelText("Menu da conta (sessão indisponível)")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Editar perfil" })).toBeInTheDocument();
  });

  it("fecha com Esc, clique fora ou escolha de um link", () => {
    renderizar({ estado: "anonimo" });
    const menu = menuAberto();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(menu.open).toBe(false);
    expect(document.querySelector("summary")).toHaveFocus();

    menu.open = true;
    fireEvent.pointerDown(document.body);
    expect(menu.open).toBe(false);

    menu.open = true;
    fireEvent.click(screen.getByRole("link", { name: "Entrar" }));
    expect(menu.open).toBe(false);
  });

  it("fecha quando o foco sai do menu pelo teclado, mas não enquanto fica dentro dele", () => {
    renderizar({ estado: "anonimo" });
    const menu = menuAberto();
    const entrar = screen.getByRole("link", { name: "Entrar" });
    const criarConta = screen.getByRole("link", { name: "Criar conta" });
    const fora = document.createElement("button");
    document.body.appendChild(fora);

    fireEvent.focusOut(entrar, { relatedTarget: criarConta });
    expect(menu.open).toBe(true);

    fireEvent.focusOut(criarConta, { relatedTarget: null });
    expect(menu.open).toBe(true);

    fireEvent.focusOut(criarConta, { relatedTarget: fora });
    expect(menu.open).toBe(false);
    fora.remove();
  });

  it("não fecha ao clicar dentro do menu", () => {
    renderizar({ estado: "anonimo" });
    const menu = menuAberto();

    fireEvent.pointerDown(screen.getByRole("link", { name: "Criar conta" }));
    expect(menu.open).toBe(true);
  });
});
