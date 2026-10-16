import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FormularioAlteracaoSenha } from "../components/FormularioAlteracaoSenha";
import { alterarSenha } from "../services/alterarSenha";
import type { Usuario } from "../types/usuario";

const iniciarSessao = jest.fn();

jest.mock("@/modules/autenticacao/hooks/useAutenticacao", () => ({ useAutenticacao: () => ({ iniciarSessao }) }));
jest.mock("../services/alterarSenha");

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

function campo(nome: string) {
  return document.querySelector<HTMLInputElement>(`input[name="${nome}"]`)!;
}

function preencher(valores: Record<string, string>) {
  for (const [nome, valor] of Object.entries(valores)) {
    fireEvent.change(campo(nome), { target: { value: valor } });
  }
}

const validos = { senhaAtual: "senha-antiga-1", novaSenha: "senha-nova-123", confirmacaoNovaSenha: "senha-nova-123" };

describe("FormularioAlteracaoSenha", () => {
  beforeEach(() => jest.resetAllMocks());

  it("foca a senha atual quando ela está vazia e não chama o backend", async () => {
    render(<FormularioAlteracaoSenha usuario={usuario} />);

    fireEvent.click(screen.getByRole("button", { name: "Alterar senha" }));

    await waitFor(() => expect(campo("senhaAtual")).toHaveFocus());
    expect(alterarSenha).not.toHaveBeenCalled();
  });

  it("recusa a confirmação diferente da nova senha", async () => {
    render(<FormularioAlteracaoSenha usuario={usuario} />);

    preencher({ ...validos, confirmacaoNovaSenha: "outra-senha-123" });
    fireEvent.click(screen.getByRole("button", { name: "Alterar senha" }));

    await waitFor(() => expect(campo("confirmacaoNovaSenha")).toHaveAttribute("aria-invalid", "true"));
    expect(alterarSenha).not.toHaveBeenCalled();
  });

  it("mostra o erro do backend quando a senha atual está errada", async () => {
    jest.mocked(alterarSenha).mockResolvedValue({ erros: { senhaAtual: "Senha atual incorreta." } });
    render(<FormularioAlteracaoSenha usuario={usuario} />);

    preencher(validos);
    fireEvent.click(screen.getByRole("button", { name: "Alterar senha" }));

    expect(await screen.findByText("Senha atual incorreta.")).toBeInTheDocument();
    await waitFor(() => expect(campo("senhaAtual")).toHaveFocus());
  });

  it("confirma o sucesso, guarda os tokens novos e limpa os campos", async () => {
    jest.mocked(alterarSenha).mockResolvedValue({ tokens: { access: "novo-a", refresh: "novo-r" } });
    render(<FormularioAlteracaoSenha usuario={usuario} />);

    preencher(validos);
    fireEvent.click(screen.getByRole("button", { name: "Alterar senha" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Senha alterada com sucesso.");
    expect(iniciarSessao).toHaveBeenCalledWith({ access: "novo-a", refresh: "novo-r", user: usuario });
    expect(campo("senhaAtual")).toHaveValue("");
    expect(campo("novaSenha")).toHaveValue("");
  });
});
