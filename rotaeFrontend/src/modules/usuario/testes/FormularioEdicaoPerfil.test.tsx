import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FormularioEdicaoPerfil } from "../components/FormularioEdicaoPerfil";
import { alterarSenha } from "../services/alterarSenha";
import { atualizarUsuario } from "../services/atualizarUsuario";
import { usuario } from "./fixtures/usuario";

const atualizarSessao = jest.fn();

jest.mock("@/modules/autenticacao/hooks/useAutenticacao", () => ({ useAutenticacao: () => ({ atualizarSessao }) }));
jest.mock("../services/atualizarUsuario");
jest.mock("../services/alterarSenha");

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

  it("grava na sessão o usuário devolvido pelo servidor", async () => {
    const atualizado = { ...usuario, nome: "João Souza" };
    jest.mocked(atualizarUsuario).mockResolvedValue({ usuario: atualizado });
    render(<FormularioEdicaoPerfil usuario={usuario} aoCancelar={jest.fn()} />);

    preencher({ nome: "João Souza" });
    salvar();

    await screen.findByText("Dados atualizados com sucesso.");
    expect(atualizarSessao).toHaveBeenCalledWith({ user: atualizado });
  });

  it("grava na sessão os tokens novos depois de trocar a senha e limpa os campos de senha", async () => {
    const tokens = { access: "novo-a", refresh: "novo-r" };
    jest.mocked(alterarSenha).mockResolvedValue({ tokens });
    render(<FormularioEdicaoPerfil usuario={usuario} aoCancelar={jest.fn()} />);

    preencher(senhaValida);
    salvar();

    await screen.findByText("Senha alterada com sucesso.");
    expect(atualizarSessao).toHaveBeenCalledWith(tokens);
    expect(campo("senhaAtual")).toHaveValue("");
    expect(campo("novaSenha")).toHaveValue("");
    expect(campo("confirmacaoNovaSenha")).toHaveValue("");
  });

  it("mostra o campo vazio para quem não tem data de nascimento e pede o preenchimento ao salvar", async () => {
    render(<FormularioEdicaoPerfil usuario={{ ...usuario, dataNasc: null }} aoCancelar={jest.fn()} />);

    expect(campo("dataNasc")).toHaveValue("");
    preencher({ nome: "João Souza" });
    salvar();

    expect(await screen.findByText("Informe sua data de nascimento.")).toBeInTheDocument();
    expect(atualizarUsuario).not.toHaveBeenCalled();

    preencher({ dataNasc: "1995-04-20" });
    salvar();

    expect(await screen.findByText("Dados atualizados com sucesso.")).toBeInTheDocument();
  });

  it("não mexe na sessão quando o servidor recusa os dados", async () => {
    jest.mocked(atualizarUsuario).mockResolvedValue({ erros: { email: "Já existe um usuário com este e-mail." } });
    render(<FormularioEdicaoPerfil usuario={usuario} aoCancelar={jest.fn()} />);

    preencher({ email: "outro@email.com" });
    salvar();

    await screen.findByText("Já existe um usuário com este e-mail.");
    expect(atualizarSessao).not.toHaveBeenCalled();
  });

  it("mantém o que foi digitado quando a rede falha na troca de senha", async () => {
    jest.mocked(alterarSenha).mockRejectedValue(new Error("falha"));
    render(<FormularioEdicaoPerfil usuario={usuario} aoCancelar={jest.fn()} />);

    preencher(senhaValida);
    salvar();

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível alterar a senha. Tente novamente.");
    expect(campo("senhaAtual")).toHaveValue(senhaValida.senhaAtual);
    expect(campo("novaSenha")).toHaveValue(senhaValida.novaSenha);
  });

  it("mantém o que foi digitado quando a rede falha ao salvar os dados", async () => {
    jest.mocked(atualizarUsuario).mockRejectedValue(new Error("falha"));
    render(<FormularioEdicaoPerfil usuario={usuario} aoCancelar={jest.fn()} />);

    preencher({ nome: "João Souza" });
    salvar();

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível salvar as alterações. Tente novamente.");
    expect(campo("nome")).toHaveValue("João Souza");
  });

  it("esconde a mensagem de sucesso assim que o usuário volta a editar", async () => {
    render(<FormularioEdicaoPerfil usuario={usuario} aoCancelar={jest.fn()} />);

    preencher({ nome: "João Souza" });
    salvar();
    await screen.findByText("Dados atualizados com sucesso.");

    preencher({ nome: "João Souza Lima" });
    expect(screen.queryByText("Dados atualizados com sucesso.")).not.toBeInTheDocument();
  });

  describe("erros antigos não ficam na tela", () => {
    it("o erro da senha some quando o usuário salva de novo só os dados", async () => {
      jest.mocked(alterarSenha).mockResolvedValue({ erros: { senhaAtual: "Senha atual incorreta." } });
      render(<FormularioEdicaoPerfil usuario={usuario} aoCancelar={jest.fn()} />);

      preencher(senhaValida);
      salvar();
      await screen.findByText("Senha atual incorreta.");

      preencher({ senhaAtual: "", novaSenha: "", confirmacaoNovaSenha: "", nome: "João Souza" });
      salvar();

      expect(await screen.findByText("Dados atualizados com sucesso.")).toBeInTheDocument();
      expect(screen.queryByText("Senha atual incorreta.")).not.toBeInTheDocument();
    });

    it("o erro dos dados some quando o usuário corrige e salva de novo", async () => {
      jest.mocked(atualizarUsuario).mockResolvedValueOnce({ erros: { email: "Já existe um usuário com este e-mail." } });
      render(<FormularioEdicaoPerfil usuario={usuario} aoCancelar={jest.fn()} />);

      preencher({ email: "outro@email.com" });
      salvar();
      await screen.findByText("Já existe um usuário com este e-mail.");

      preencher({ email: "livre@email.com" });
      salvar();

      expect(await screen.findByText("Dados atualizados com sucesso.")).toBeInTheDocument();
      expect(screen.queryByText("Já existe um usuário com este e-mail.")).not.toBeInTheDocument();
    });

    it("o aviso de falha de rede some quando o salvamento seguinte dá certo", async () => {
      jest.mocked(atualizarUsuario).mockRejectedValueOnce(new Error("falha"));
      render(<FormularioEdicaoPerfil usuario={usuario} aoCancelar={jest.fn()} />);

      preencher({ nome: "João Souza" });
      salvar();
      await screen.findByRole("alert");

      salvar();

      expect(await screen.findByText("Dados atualizados com sucesso.")).toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  it("chama aoCancelar ao clicar em Cancelar, sem salvar nada", () => {
    const aoCancelar = jest.fn();
    render(<FormularioEdicaoPerfil usuario={usuario} aoCancelar={aoCancelar} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(aoCancelar).toHaveBeenCalledTimes(1);
    expect(atualizarUsuario).not.toHaveBeenCalled();
  });
});
