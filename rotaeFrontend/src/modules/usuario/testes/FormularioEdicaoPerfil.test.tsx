import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FormularioEdicaoPerfil } from "../components/FormularioEdicaoPerfil";
import { alterarSenha } from "../services/alterarSenha";
import { atualizarUsuario } from "../services/atualizarUsuario";
import type { Usuario } from "../types/usuario";

const iniciarSessao = jest.fn();

jest.mock("@/modules/autenticacao/hooks/useAutenticacao", () => ({ useAutenticacao: () => ({ iniciarSessao }) }));
jest.mock("@/modules/autenticacao/utils/sessaoSalva", () => ({ lerSessao: () => ({ access: "a", refresh: "r" }) }));
jest.mock("../services/atualizarUsuario");
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

const senhaValida = { senhaAtual: "senha-antiga-1", novaSenha: "senha-nova-123", confirmacaoNovaSenha: "senha-nova-123" };

function campo(nome: string) {
  return document.querySelector<HTMLInputElement>(`input[name="${nome}"]`)!;
}

function preencher(valores: Record<string, string>) {
  for (const [nome, valor] of Object.entries(valores)) {
    fireEvent.change(campo(nome), { target: { value: valor } });
  }
}

function salvar() {
  fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
}

describe("FormularioEdicaoPerfil", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(atualizarUsuario).mockResolvedValue({ usuario });
  });

  it("mostra o usuário no cabeçalho e os dados atuais nos campos", () => {
    render(<FormularioEdicaoPerfil usuario={usuario} aoCancelar={jest.fn()} />);

    expect(screen.getAllByText("João Silva")).not.toHaveLength(0);
    expect(campo("nome")).toHaveValue("João Silva");
    expect(campo("email")).toHaveValue("joao@email.com");
    expect(campo("celular")).toHaveValue("(85) 99999-0000");
    expect(campo("dataNasc")).toHaveValue("1995-04-20");
  });

  it("mostra o CPF bloqueado para edição", () => {
    render(<FormularioEdicaoPerfil usuario={usuario} aoCancelar={jest.fn()} />);

    expect(campo("cpf")).toHaveValue("529.982.247-25");
    expect(campo("cpf")).toBeDisabled();
  });

  it("salva só os dados quando a senha não foi preenchida", async () => {
    jest.mocked(atualizarUsuario).mockResolvedValue({ usuario: { ...usuario, celular: "(85) 98888-0000" } });
    render(<FormularioEdicaoPerfil usuario={usuario} aoCancelar={jest.fn()} />);

    preencher({ celular: "(85) 98888-0000" });
    salvar();

    expect(await screen.findByText("Dados atualizados com sucesso.")).toBeInTheDocument();
    expect(alterarSenha).not.toHaveBeenCalled();
  });

  it("foca o primeiro campo inválido sem chamar o backend", async () => {
    render(<FormularioEdicaoPerfil usuario={usuario} aoCancelar={jest.fn()} />);

    preencher({ nome: "" });
    salvar();

    await waitFor(() => expect(campo("nome")).toHaveFocus());
    expect(campo("nome")).toHaveAttribute("aria-invalid", "true");
    expect(atualizarUsuario).not.toHaveBeenCalled();
  });

  it("troca a senha e depois salva os dados quando os campos de senha são preenchidos", async () => {
    jest.mocked(alterarSenha).mockResolvedValue({ tokens: { access: "novo-a", refresh: "novo-r" } });
    render(<FormularioEdicaoPerfil usuario={usuario} aoCancelar={jest.fn()} />);

    preencher(senhaValida);
    salvar();

    expect(await screen.findByText("Senha alterada com sucesso.")).toBeInTheDocument();
    await waitFor(() => expect(atualizarUsuario).toHaveBeenCalledTimes(1));
    expect(alterarSenha).toHaveBeenCalledTimes(1);
    expect(campo("senhaAtual")).toHaveValue("");
  });

  it("não salva os dados se a troca de senha for recusada", async () => {
    jest.mocked(alterarSenha).mockResolvedValue({ erros: { senhaAtual: "Senha atual incorreta." } });
    render(<FormularioEdicaoPerfil usuario={usuario} aoCancelar={jest.fn()} />);

    preencher(senhaValida);
    salvar();

    expect(await screen.findByText("Senha atual incorreta.")).toBeInTheDocument();
    await waitFor(() => expect(campo("senhaAtual")).toHaveFocus());
    expect(atualizarUsuario).not.toHaveBeenCalled();
  });

  it("recusa a confirmação diferente da nova senha sem chamar o backend", async () => {
    render(<FormularioEdicaoPerfil usuario={usuario} aoCancelar={jest.fn()} />);

    preencher({ ...senhaValida, confirmacaoNovaSenha: "outra-senha-123" });
    salvar();

    await waitFor(() => expect(campo("confirmacaoNovaSenha")).toHaveAttribute("aria-invalid", "true"));
    expect(alterarSenha).not.toHaveBeenCalled();
    expect(atualizarUsuario).not.toHaveBeenCalled();
  });

  it("mostra o erro do backend no campo certo", async () => {
    jest.mocked(atualizarUsuario).mockResolvedValue({ erros: { email: "Já existe um usuário com este e-mail." } });
    render(<FormularioEdicaoPerfil usuario={usuario} aoCancelar={jest.fn()} />);

    salvar();

    expect(await screen.findByText("Já existe um usuário com este e-mail.")).toBeInTheDocument();
    await waitFor(() => expect(campo("email")).toHaveFocus());
  });

  it("avisa quando o servidor não responde", async () => {
    jest.mocked(atualizarUsuario).mockRejectedValue(new Error("falha"));
    render(<FormularioEdicaoPerfil usuario={usuario} aoCancelar={jest.fn()} />);

    salvar();

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível salvar as alterações.");
  });

  it("chama aoCancelar ao clicar em Cancelar, sem salvar nada", () => {
    const aoCancelar = jest.fn();
    render(<FormularioEdicaoPerfil usuario={usuario} aoCancelar={aoCancelar} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(aoCancelar).toHaveBeenCalledTimes(1);
    expect(atualizarUsuario).not.toHaveBeenCalled();
  });
});
