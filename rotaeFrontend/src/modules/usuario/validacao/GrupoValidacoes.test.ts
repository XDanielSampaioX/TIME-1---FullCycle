
import { GrupoValidacoes } from "./GrupoValidacoes";
import { ValidacaoCampo } from "./ValidacaoCampo";
import type { CadastroUsuarioPayload } from "../types/cadastroUsuarioPayload";

const dados: CadastroUsuarioPayload = {
  nome: "",
  email: "",
  senha: "",
  celular: "",
  dataNasc: "",
  cpf: "",
};

describe("GrupoValidacoes - Composite", () => {
  it("retorna erro quando um campo é inválido", () => {
    const grupo = new GrupoValidacoes([
      new ValidacaoCampo(
        "nome",
        (valor) => valor.trim().length >= 2,
        "Nome inválido"
      ),
    ]);

    const resultado = grupo.validar(dados);

    expect(resultado).toEqual({
      nome: "Nome inválido",
    });
  });

  it("permite grupos dentro de outros grupos", () => {
    const grupo = new GrupoValidacoes([
      new GrupoValidacoes([
        new ValidacaoCampo(
          "nome",
          (valor) => valor.length >= 2,
          "Nome obrigatório"
        ),
      ]),
      new ValidacaoCampo(
        "email",
        (valor) => valor.includes("@"),
        "E-mail inválido"
      ),
    ]);

    const resultado = grupo.validar(dados);

    expect(resultado).toEqual({
      nome: "Nome obrigatório",
      email: "E-mail inválido",
    });
  });

  it("preserva a primeira mensagem de erro", () => {
    const grupo = new GrupoValidacoes([
      new ValidacaoCampo(
        "senha",
        (valor) => valor.length >= 8,
        "Senha muito curta"
      ),
      new ValidacaoCampo(
        "senha",
        (valor) => /[A-Z]/.test(valor),
        "Senha sem letra maiúscula"
      ),
    ]);

    const resultado = grupo.validar(dados);

    expect(resultado.senha).toBe("Senha muito curta");
  });

  it("retorna um objeto vazio quando os dados são válidos", () => {
    const grupo = new GrupoValidacoes([
      new ValidacaoCampo(
        "nome",
        (valor) => valor.length >= 2,
        "Nome inválido"
      ),
    ]);

    const resultado = grupo.validar({
      ...dados,
      nome: "Daniel",
    });

    expect(resultado).toEqual({});
  });
});
