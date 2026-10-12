import { regrasCadastroUsuario } from "../classes/regrasCadastroUsuario";
import type { CadastroUsuario } from "../types/cadastroUsuario";

const dadosValidos: CadastroUsuario = {
  nome: "João Silva",
  cpf: "529.982.247-25",
  dataNasc: "1995-04-20",
  celular: "(85) 99999-0000",
  email: "joao@email.com",
  senha: "senha-forte-123",
};

describe("regrasCadastroUsuario", () => {
  it("não aponta erros para um cadastro válido", () => {
    expect(regrasCadastroUsuario.validar(dadosValidos)).toEqual({});
  });

  it("aceita CPF e celular sem máscara", () => {
    expect(regrasCadastroUsuario.validar({ ...dadosValidos, cpf: "52998224725", celular: "85999990000" })).toEqual({});
  });

  it("aponta todos os campos obrigatórios vazios, de todos os grupos", () => {
    const erros = regrasCadastroUsuario.validar({ nome: " ", cpf: "", dataNasc: "", celular: "", email: "", senha: "" });

    expect(Object.keys(erros).sort()).toEqual(["celular", "cpf", "dataNasc", "email", "nome", "senha"]);
    expect(erros.nome).toBe("Informe seu nome.");
  });

  it.each([
    ["cpf", "123", "CPF deve ter 11 dígitos."],
    ["celular", "8599", "Celular deve ter DDD e 10 ou 11 dígitos."],
    ["email", "joao.email.com", "Informe um e-mail válido."],
    ["senha", "1234567", "A senha deve ter pelo menos 8 caracteres."],
  ])("aponta formato inválido de %s", (campo, valor, mensagem) => {
    expect(regrasCadastroUsuario.validar({ ...dadosValidos, [campo]: valor })).toEqual({ [campo]: mensagem });
  });
});
