import { regrasAlteracaoSenha } from "../classes/validacao/regrasAlteracaoSenha";
import type { AlteracaoSenha } from "../types/alteracaoSenha";

const dadosValidos: AlteracaoSenha = {
  senhaAtual: "senha-antiga-1",
  novaSenha: "senha-nova-123",
  confirmacaoNovaSenha: "senha-nova-123",
};

describe("regrasAlteracaoSenha", () => {
  it("não aponta erros para uma troca válida", () => {
    expect(regrasAlteracaoSenha.validar(dadosValidos)).toEqual({});
  });

  it("aponta os três campos quando estão vazios", () => {
    expect(regrasAlteracaoSenha.validar({ senhaAtual: "", novaSenha: "", confirmacaoNovaSenha: "" })).toEqual({
      senhaAtual: "Informe sua senha atual.",
      novaSenha: "Informe a nova senha.",
      confirmacaoNovaSenha: "Confirme a nova senha.",
    });
  });

  it("aponta nova senha curta", () => {
    expect(regrasAlteracaoSenha.validar({ ...dadosValidos, novaSenha: "1234567", confirmacaoNovaSenha: "1234567" })).toEqual({
      novaSenha: "A senha deve ter pelo menos 8 caracteres.",
    });
  });

  it("aponta confirmação diferente da nova senha", () => {
    expect(regrasAlteracaoSenha.validar({ ...dadosValidos, confirmacaoNovaSenha: "outra-senha-123" })).toEqual({
      confirmacaoNovaSenha: "A confirmação não confere com a nova senha.",
    });
  });

  it("conta espaços como parte da senha", () => {
    const comEspacos = "senha com espaço ";

    expect(regrasAlteracaoSenha.validar({ ...dadosValidos, novaSenha: comEspacos, confirmacaoNovaSenha: comEspacos })).toEqual({});
  });
});
