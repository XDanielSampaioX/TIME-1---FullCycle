import { regrasAtualizacaoUsuario } from "../classes/validacao/regrasAtualizacaoUsuario";
import type { AtualizacaoUsuario } from "../types/atualizacaoUsuario";

const dadosValidos: AtualizacaoUsuario = {
  nome: "João Silva",
  email: "joao@email.com",
  celular: "(85) 99999-0000",
  dataNasc: "1995-04-20",
};

describe("regrasAtualizacaoUsuario", () => {
  it("não aponta erros para dados válidos", () => {
    expect(regrasAtualizacaoUsuario.validar(dadosValidos)).toEqual({});
  });

  it("aceita celular sem máscara", () => {
    expect(regrasAtualizacaoUsuario.validar({ ...dadosValidos, celular: "85999990000" })).toEqual({});
  });

  it("aponta todos os campos obrigatórios vazios, de todos os grupos", () => {
    const erros = regrasAtualizacaoUsuario.validar({ nome: " ", email: "", celular: "", dataNasc: "" });

    expect(Object.keys(erros).sort()).toEqual(["celular", "dataNasc", "email", "nome"]);
    expect(erros.nome).toBe("Informe seu nome.");
  });

  it.each([
    ["celular", "8599", "Celular deve ter DDD e 10 ou 11 dígitos."],
    ["email", "joao.email.com", "Informe um e-mail válido."],
  ])("aponta formato inválido de %s", (campo, valor, mensagem) => {
    expect(regrasAtualizacaoUsuario.validar({ ...dadosValidos, [campo]: valor })).toEqual({ [campo]: mensagem });
  });
});
