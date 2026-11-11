import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { usuario } from "@/modules/usuario/testes/fixtures/usuario";
import { FormularioLogin } from "../components/FormularioLogin";
import { entrar } from "../services/entrar";

const iniciarSessao = jest.fn();
const replace = jest.fn();

jest.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
jest.mock("../hooks/useAutenticacao", () => ({ useAutenticacao: () => ({ iniciarSessao }) }));
jest.mock("../services/entrar");

const sessao = { access: "a", refresh: "r", user: usuario };

function preencherEEntrar({ lembrar = false } = {}) {
  fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "joao@email.com" } });
  fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "senha-forte-123" } });
  if (lembrar) fireEvent.click(screen.getByLabelText("Lembrar de mim"));
  fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
}

describe("FormularioLogin", () => {
  beforeEach(() => jest.resetAllMocks());

  it("entra sem lembrar por padrão e volta para a tela de onde o usuário veio", async () => {
    jest.mocked(entrar).mockResolvedValue({ sessao });
    render(<FormularioLogin destino="/editar-perfil" />);

    expect(screen.getByLabelText("Lembrar de mim")).not.toBeChecked();
    preencherEEntrar();

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/editar-perfil"));
    expect(entrar).toHaveBeenCalledWith({ email: "joao@email.com", senha: "senha-forte-123" });
    expect(iniciarSessao).toHaveBeenCalledWith(sessao, false);
  });

  it("com Lembrar de mim marcado, pede uma sessão que continua salva", async () => {
    jest.mocked(entrar).mockResolvedValue({ sessao });
    render(<FormularioLogin destino="/" />);

    preencherEEntrar({ lembrar: true });

    await waitFor(() => expect(iniciarSessao).toHaveBeenCalledWith(sessao, true));
    expect(replace).toHaveBeenCalledWith("/");
  });

  it("mostra o erro do backend e não inicia sessão nem sai da tela", async () => {
    jest.mocked(entrar).mockResolvedValue({ erro: "E-mail ou senha inválidos." });
    render(<FormularioLogin destino="/" />);

    preencherEEntrar();

    expect(await screen.findByRole("alert")).toHaveTextContent("E-mail ou senha inválidos.");
    expect(iniciarSessao).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });

  it("avisa quando o servidor não responde e mantém o que foi digitado", async () => {
    jest.mocked(entrar).mockRejectedValue(new Error("sem rede"));
    render(<FormularioLogin destino="/" />);

    preencherEEntrar();

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível entrar. Tente novamente.");
    expect(screen.getByLabelText("E-mail")).toHaveValue("joao@email.com");
  });

  it("mostra o erro de cada campo vazio, foca o primeiro e não chama o backend", () => {
    render(<FormularioLogin destino="/" />);

    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(screen.getByLabelText("E-mail")).toHaveAccessibleDescription("Informe seu e-mail.");
    expect(screen.getByLabelText("Senha")).toHaveAccessibleDescription("Informe sua senha.");
    expect(screen.getByLabelText("E-mail")).toHaveFocus();
    expect(entrar).not.toHaveBeenCalled();
  });

  it("o erro de um campo some quando o usuário volta a digitar nele, e o do outro continua", () => {
    render(<FormularioLogin destino="/" />);
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "j" } });

    expect(screen.queryByText("Informe seu e-mail.")).not.toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toHaveAttribute("aria-invalid", "false");
    expect(screen.getByText("Informe sua senha.")).toBeInTheDocument();
  });

  it("recusa e-mail com formato inválido e limpa o erro quando o envio seguinte é válido", async () => {
    jest.mocked(entrar).mockResolvedValue({ sessao });
    render(<FormularioLogin destino="/" />);

    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "joao-sem-arroba" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "senha-forte-123" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(screen.getByLabelText("E-mail")).toHaveAccessibleDescription("Informe um e-mail válido.");
    expect(entrar).not.toHaveBeenCalled();

    preencherEEntrar();

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    expect(screen.getByLabelText("E-mail")).toHaveAttribute("aria-invalid", "false");
  });

  it("mostra e oculta a senha", () => {
    render(<FormularioLogin destino="/" />);
    const senha = screen.getByLabelText("Senha");

    expect(senha).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(senha).toHaveAttribute("type", "text");
    fireEvent.click(screen.getByRole("button", { name: "Ocultar senha" }));
    expect(senha).toHaveAttribute("type", "password");
  });

  it("não mostra Esqueci minha senha enquanto ela está em espera, e leva ao cadastro", () => {
    render(<FormularioLogin destino="/" />);

    expect(screen.queryByText(/Esqueci minha senha/)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute("href", "/cadastro");
  });
});
