import { cadastrarUsuario } from "../services/cadastrarUsuario";
import type { CadastroUsuario } from "../types/cadastroUsuario";

const dados: CadastroUsuario = {
  nome: "João Silva",
  cpf: "529.982.247-25",
  dataNasc: "1995-04-20",
  celular: "(85) 99999-0000",
  email: "joao@email.com",
  senha: "senha-forte-123",
};

function responderCom(status: number, corpo: unknown) {
  global.fetch = jest.fn().mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    json: async () => corpo,
  });
}

describe("cadastrarUsuario", () => {
  it("envia os dados e devolve o usuário criado", async () => {
    const usuario = { id: 1, nome: "João Silva" };
    responderCom(201, usuario);

    await expect(cadastrarUsuario(dados)).resolves.toEqual({ usuario });
    expect(global.fetch).toHaveBeenCalledWith("/api/v1/usuarios/", expect.objectContaining({
      method: "POST",
      body: JSON.stringify(dados),
    }));
  });

  it("devolve a primeira mensagem de cada campo recusado pelo backend", async () => {
    responderCom(400, { cpf: ["CPF inválido."], senha: ["Senha muito curta.", "Senha muito comum."] });

    await expect(cadastrarUsuario(dados)).resolves.toEqual({
      erros: { cpf: "CPF inválido.", senha: "Senha muito curta." },
    });
  });

  it("lança erro quando o servidor falha", async () => {
    responderCom(500, {});

    await expect(cadastrarUsuario(dados)).rejects.toThrow("Não foi possível criar a conta.");
  });
});
