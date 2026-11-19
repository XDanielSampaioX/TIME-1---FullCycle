import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { entrar } from "@/modules/autenticacao/services/entrar";
import { FormularioCadastroUsuario } from "../components/FormularioCadastroUsuario";
import { cadastrarUsuario } from "../services/cadastrarUsuario";
import { usuario } from "./fixtures/usuario";

const iniciarSessao = jest.fn();
const replace = jest.fn();

jest.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
jest.mock("@/modules/autenticacao/hooks/useAutenticacao", () => ({ useAutenticacao: () => ({ iniciarSessao }) }));
jest.mock("@/modules/autenticacao/services/entrar");
jest.mock("../services/cadastrarUsuario");

const sessao = { access: "a", refresh: "r", user: usuario };
const rotulos = {
  nome: "Nome completo",
  email: "E-mail",
  cpf: "CPF",
  celular: "Celular",
  dataNasc: "Data de nascimento",
  senha: "Senha",
  confirmacaoSenha: "Confirmar senha",
};
type Campo = keyof typeof rotulos;
const preenchido: Record<Campo, string> = {
  nome: "João Silva",
  email: "joao@email.com",
  cpf: "529.982.247-25",
  celular: "(85) 99999-0000",
  dataNasc: "1995-04-20",
  senha: "senha-forte-123",
  confirmacaoSenha: "senha-forte-123",
};

const campo = (nome: Campo) => screen.getByLabelText<HTMLInputElement>(rotulos[nome]);
const criarConta = () => fireEvent.click(screen.getByRole("button", { name: "Criar minha conta" }));
function preencher(valores: Partial<Record<Campo, string>> = preenchido) {
  for (const [nome, valor] of Object.entries(valores)) fireEvent.change(campo(nome as Campo), { target: { value: valor } });
}

describe("FormularioCadastroUsuario", () => {
  beforeEach(() => jest.resetAllMocks());

  it("mostra os campos do protótipo, na ordem, e os links para entrar com o destino", () => {
    render(<FormularioCadastroUsuario destino="/viagens/7/assentos" />);

    const nomes = Array.from(document.querySelectorAll("input")).map((input) => input.name);
    expect(nomes).toEqual(["nome", "email", "cpf", "celular", "dataNasc", "senha", "confirmacaoSenha"]);
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/login?voltar=%2Fviagens%2F7%2Fassentos");
  });

  it("campos vazios: um erro por campo, foco no primeiro, e o backend não é chamado", () => {
    render(<FormularioCadastroUsuario destino="/" />);

    criarConta();

    expect(campo("nome")).toHaveAccessibleDescription("Informe seu nome.");
    expect(campo("confirmacaoSenha")).toHaveAccessibleDescription("Confirme sua senha.");
    expect(campo("nome")).toHaveFocus();
    expect(cadastrarUsuario).not.toHaveBeenCalled();
  });

  it("confirmação diferente da senha é recusada antes do envio", () => {
    render(<FormularioCadastroUsuario destino="/" />);

    preencher({ ...preenchido, confirmacaoSenha: "outra-senha-123" });
    criarConta();

    expect(campo("confirmacaoSenha")).toHaveAccessibleDescription("A confirmação não confere com a senha.");
    expect(campo("confirmacaoSenha")).toHaveFocus();
    expect(cadastrarUsuario).not.toHaveBeenCalled();
  });

  it("depois de um envio com erro, digitar some com o erro do campo e não tira o foco dele", () => {
    render(<FormularioCadastroUsuario destino="/" />);
    criarConta();

    campo("email").focus();
    fireEvent.change(campo("email"), { target: { value: "j" } });
    fireEvent.change(campo("email"), { target: { value: "jo" } });

    expect(document.activeElement).toBe(campo("email"));
    expect(campo("email")).toHaveAttribute("aria-invalid", "false");
    expect(campo("nome")).toHaveAccessibleDescription("Informe seu nome.");
  });

  it("cria a conta sem enviar a confirmação, entra sem 'Lembrar de mim' e volta para a tela de origem", async () => {
    jest.mocked(cadastrarUsuario).mockResolvedValue({ usuario });
    jest.mocked(entrar).mockResolvedValue({ sessao });
    render(<FormularioCadastroUsuario destino="/viagens/7/assentos" />);

    preencher();
    criarConta();

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/viagens/7/assentos"));
    const { confirmacaoSenha, ...semConfirmacao } = preenchido;
    expect(confirmacaoSenha).toBe(preenchido.senha);
    expect(cadastrarUsuario).toHaveBeenCalledWith(semConfirmacao);
    expect(entrar).toHaveBeenCalledWith({ email: preenchido.email, senha: preenchido.senha });
    expect(iniciarSessao).toHaveBeenCalledWith(sessao, false);
    expect(screen.getByRole("button", { name: "Criando conta..." })).toBeDisabled();
  });

  it("erros do backend aparecem no campo certo, com foco nele, e o que foi digitado continua", async () => {
    jest.mocked(cadastrarUsuario).mockResolvedValue({ erros: { email: "Já existe um usuário com este e-mail." } });
    render(<FormularioCadastroUsuario destino="/" />);

    preencher();
    criarConta();

    await waitFor(() => expect(campo("email")).toHaveAccessibleDescription("Já existe um usuário com este e-mail."));
    expect(campo("email")).toHaveFocus();
    expect(campo("nome")).toHaveValue(preenchido.nome);
    expect(campo("senha")).toHaveValue(preenchido.senha);
    expect(screen.getByRole("button", { name: "Criar minha conta" })).toBeEnabled();
    expect(entrar).not.toHaveBeenCalled();
  });

  it("um erro geral do backend aparece mesmo quando vem junto com erros de campo", async () => {
    jest.mocked(cadastrarUsuario).mockResolvedValue({
      erros: { email: "Já existe um usuário com este e-mail.", nonFieldErrors: "Revise os dados." } as never,
    });
    render(<FormularioCadastroUsuario destino="/" />);

    preencher();
    criarConta();

    expect(await screen.findByRole("alert")).toHaveTextContent("Revise os dados.");
    expect(campo("email")).toHaveAccessibleDescription("Já existe um usuário com este e-mail.");
  });

  it("um nome de campo que não é do formulário (ex.: toString) não vira erro de campo", async () => {
    jest.mocked(cadastrarUsuario).mockResolvedValue({ erros: { toString: "Erro estranho." } as never });
    render(<FormularioCadastroUsuario destino="/" />);

    preencher();
    criarConta();

    expect(await screen.findByRole("alert")).toHaveTextContent("Erro estranho.");
  });

  it("corrigir a senha tira o erro antigo de 'não confere' da confirmação", () => {
    render(<FormularioCadastroUsuario destino="/" />);
    preencher({ ...preenchido, confirmacaoSenha: "outra-senha-123" });
    criarConta();
    expect(campo("confirmacaoSenha")).toHaveAccessibleDescription("A confirmação não confere com a senha.");

    fireEvent.change(campo("senha"), { target: { value: "outra-senha-123" } });

    expect(campo("confirmacaoSenha")).toHaveAttribute("aria-invalid", "false");
  });

  it("um erro do backend fora dos campos aparece como aviso geral", async () => {
    jest.mocked(cadastrarUsuario).mockResolvedValue({ erros: { nonFieldErrors: "Cadastro indisponível." } as never });
    render(<FormularioCadastroUsuario destino="/" />);

    preencher();
    criarConta();

    expect(await screen.findByRole("alert")).toHaveTextContent("Cadastro indisponível.");
  });

  it("falha de comunicação: avisa, mantém o que foi digitado e deixa tentar de novo", async () => {
    jest.mocked(cadastrarUsuario).mockRejectedValue(new Error("sem rede"));
    render(<FormularioCadastroUsuario destino="/" />);

    preencher();
    criarConta();

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível criar a conta. Tente novamente.");
    for (const [nome, valor] of Object.entries(preenchido)) expect(campo(nome as Campo)).toHaveValue(valor);
    expect(screen.getByRole("button", { name: "Criar minha conta" })).toBeEnabled();
  });

  it("o aviso geral some no envio seguinte", async () => {
    jest.mocked(cadastrarUsuario).mockRejectedValueOnce(new Error("sem rede")).mockResolvedValueOnce({ usuario });
    jest.mocked(entrar).mockResolvedValue({ sessao });
    render(<FormularioCadastroUsuario destino="/" />);

    preencher();
    criarConta();
    await screen.findByRole("alert");
    criarConta();

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it.each([
    ["o login automático recusa", () => jest.mocked(entrar).mockResolvedValue({ erro: "E-mail ou senha inválidos." })],
    ["o login automático fica sem resposta", () => jest.mocked(entrar).mockRejectedValue(new Error("sem rede"))],
  ])("conta criada mas %s: avisa e leva ao login com o destino, sem mostrar o formulário de novo", async (_caso, configurar) => {
    jest.mocked(cadastrarUsuario).mockResolvedValue({ usuario });
    configurar();
    render(<FormularioCadastroUsuario destino="/editar-perfil" />);

    preencher();
    criarConta();

    expect(await screen.findByRole("status")).toHaveTextContent("Conta criada com sucesso! Entre para continuar.");
    expect(screen.getByRole("link", { name: "Entrar na minha conta" })).toHaveAttribute("href", "/login?voltar=%2Feditar-perfil");
    expect(screen.queryByRole("button", { name: "Criar minha conta" })).not.toBeInTheDocument();
    expect(iniciarSessao).not.toHaveBeenCalled();
  });
});

describe("FormularioCadastroUsuario: máscaras", () => {
  beforeEach(() => jest.resetAllMocks());

  it("formata CPF e celular enquanto a pessoa digita só os números", () => {
    render(<FormularioCadastroUsuario destino="/" />);

    preencher({ cpf: "52998224725", celular: "85999990000" });

    expect(campo("cpf")).toHaveValue("529.982.247-25");
    expect(campo("celular")).toHaveValue("(85) 99999-0000");
  });

  it("envia o CPF e o celular com máscara, que o backend normaliza para números", async () => {
    jest.mocked(cadastrarUsuario).mockResolvedValue({ usuario });
    jest.mocked(entrar).mockResolvedValue({ sessao });
    render(<FormularioCadastroUsuario destino="/" />);

    preencher({ ...preenchido, cpf: "52998224725", celular: "85999990000" });
    criarConta();

    await waitFor(() => expect(cadastrarUsuario).toHaveBeenCalledWith(expect.objectContaining({
      cpf: "529.982.247-25",
      celular: "(85) 99999-0000",
    })));
  });
});
