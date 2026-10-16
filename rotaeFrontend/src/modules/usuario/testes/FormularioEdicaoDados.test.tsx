import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FormularioEdicaoDados } from "../components/FormularioEdicaoDados";
import { atualizarUsuario } from "../services/atualizarUsuario";
import type { Usuario } from "../types/usuario";

const iniciarSessao = jest.fn();

jest.mock("@/modules/autenticacao/hooks/useAutenticacao", () => ({ useAutenticacao: () => ({ iniciarSessao }) }));
jest.mock("@/modules/autenticacao/utils/sessaoSalva", () => ({
  lerSessao: () => ({ access: "a", refresh: "r" }),
}));
jest.mock("../services/atualizarUsuario");

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

describe("FormularioEdicaoDados", () => {
  beforeEach(() => jest.resetAllMocks());

  it("começa preenchido com os dados atuais e sem campo de CPF", () => {
    render(<FormularioEdicaoDados usuario={usuario} />);

    expect(campo("nome")).toHaveValue("João Silva");
    expect(campo("email")).toHaveValue("joao@email.com");
    expect(campo("celular")).toHaveValue("(85) 99999-0000");
    expect(campo("dataNasc")).toHaveValue("1995-04-20");
    expect(campo("cpf")).toBeNull();
  });

  it("mostra o erro e foca o campo inválido sem chamar o backend", async () => {
    render(<FormularioEdicaoDados usuario={usuario} />);

    fireEvent.change(campo("nome"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() => expect(campo("nome")).toHaveFocus());
    expect(campo("nome")).toHaveAttribute("aria-invalid", "true");
    expect(atualizarUsuario).not.toHaveBeenCalled();
  });

  it("mostra o erro devolvido pelo backend no campo certo", async () => {
    jest.mocked(atualizarUsuario).mockResolvedValue({ erros: { email: "Já existe um usuário com este e-mail." } });
    render(<FormularioEdicaoDados usuario={usuario} />);

    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(await screen.findByText("Já existe um usuário com este e-mail.")).toBeInTheDocument();
    await waitFor(() => expect(campo("email")).toHaveFocus());
  });

  it("confirma o sucesso e atualiza a sessão", async () => {
    jest.mocked(atualizarUsuario).mockResolvedValue({ usuario: { ...usuario, nome: "João Souza" } });
    render(<FormularioEdicaoDados usuario={usuario} />);

    fireEvent.change(campo("nome"), { target: { value: "João Souza" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Dados atualizados com sucesso.");
    expect(iniciarSessao).toHaveBeenCalledWith(expect.objectContaining({ user: expect.objectContaining({ nome: "João Souza" }) }));
  });

  it("avisa quando o servidor não responde", async () => {
    jest.mocked(atualizarUsuario).mockRejectedValue(new Error("falha"));
    render(<FormularioEdicaoDados usuario={usuario} />);

    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível salvar as alterações.");
  });
});
