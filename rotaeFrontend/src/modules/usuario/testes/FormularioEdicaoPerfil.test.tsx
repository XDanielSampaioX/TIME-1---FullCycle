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

const rotulos: Record<string, string> = {
  nome: "Nome completo",
  email: "E-mail",
  celular: "Celular",
  cpf: "CPF",
  dataNasc: "Data de nascimento",
  senhaAtual: "Senha atual",
  novaSenha: "Nova senha",
  confirmacaoNovaSenha: "Confirmar nova senha",
};

// Busca pelo nome acessível (o rótulo), o que também garante que o campo está rotulado.
function campo(nome: string) {
  return screen.getByLabelText<HTMLInputElement>(rotulos[nome]);
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

  it("mostra o CPF bloqueado para edição, com o motivo", () => {
    render(<FormularioEdicaoPerfil usuario={usuario} aoCancelar={jest.fn()} />);

    expect(campo("cpf")).toHaveValue("529.982.247-25");
    expect(campo("cpf")).toBeDisabled();
    expect(campo("cpf")).toHaveAccessibleDescription("O CPF não pode ser alterado.");
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

  it("troca só a senha, sem enviar dados que não mudaram", async () => {
    jest.mocked(alterarSenha).mockResolvedValue({ tokens: { access: "novo-a", refresh: "novo-r" } });
    render(<FormularioEdicaoPerfil usuario={usuario} aoCancelar={jest.fn()} />);

    preencher(senhaValida);
    salvar();

    expect(await screen.findByText("Senha alterada com sucesso.")).toBeInTheDocument();
    expect(alterarSenha).toHaveBeenCalledTimes(1);
    expect(atualizarUsuario).not.toHaveBeenCalled();
    expect(screen.queryByText("Dados atualizados com sucesso.")).not.toBeInTheDocument();
    expect(campo("senhaAtual")).toHaveValue("");
  });

  it("troca a senha e salva os dados alterados na mesma ação", async () => {
    jest.mocked(alterarSenha).mockResolvedValue({ tokens: { access: "novo-a", refresh: "novo-r" } });
    render(<FormularioEdicaoPerfil usuario={usuario} aoCancelar={jest.fn()} />);

    preencher({ ...senhaValida, nome: "João Souza" });
    salvar();

    expect(await screen.findByText("Senha alterada com sucesso.")).toBeInTheDocument();
    expect(await screen.findByText("Dados atualizados com sucesso.")).toBeInTheDocument();
    expect(alterarSenha).toHaveBeenCalledTimes(1);
    expect(atualizarUsuario).toHaveBeenCalledTimes(1);
  });

  it("não chama nenhum serviço se os dados forem inválidos e a senha estiver preenchida", async () => {
    render(<FormularioEdicaoPerfil usuario={usuario} aoCancelar={jest.fn()} />);

    preencher({ ...senhaValida, email: "email-invalido" });
    salvar();

    await waitFor(() => expect(campo("email")).toHaveAttribute("aria-invalid", "true"));
    expect(alterarSenha).not.toHaveBeenCalled();
    expect(atualizarUsuario).not.toHaveBeenCalled();
  });

  it("ignora a senha atual preenchida sozinha (ex.: pelo navegador) e salva só os dados", async () => {
    render(<FormularioEdicaoPerfil usuario={usuario} aoCancelar={jest.fn()} />);

    preencher({ senhaAtual: "senha-salva-no-navegador", nome: "João Souza" });
    salvar();

    expect(await screen.findByText("Dados atualizados com sucesso.")).toBeInTheDocument();
    expect(alterarSenha).not.toHaveBeenCalled();
    expect(screen.queryByText(/nova senha/i, { selector: "span.text-red-700" })).not.toBeInTheDocument();
  });

  it("avisa que não há nada para salvar quando nada mudou", () => {
    render(<FormularioEdicaoPerfil usuario={usuario} aoCancelar={jest.fn()} />);

    salvar();

    expect(screen.getByRole("status")).toHaveTextContent("Nenhuma alteração para salvar.");
    expect(atualizarUsuario).not.toHaveBeenCalled();
    expect(alterarSenha).not.toHaveBeenCalled();
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

    preencher({ email: "outro@email.com" });
    salvar();

    expect(await screen.findByText("Já existe um usuário com este e-mail.")).toBeInTheDocument();
    await waitFor(() => expect(campo("email")).toHaveFocus());
  });

  it("avisa quando o servidor não responde", async () => {
    jest.mocked(atualizarUsuario).mockRejectedValue(new Error("falha"));
    render(<FormularioEdicaoPerfil usuario={usuario} aoCancelar={jest.fn()} />);

    preencher({ nome: "João Souza" });
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
