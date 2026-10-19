import { GrupoRegrasValidacao } from "../classes/validacao/GrupoRegrasValidacao";
import { RegraCampoObrigatorio } from "../classes/validacao/RegraCampoObrigatorio";
import { RegraFormatoCampo } from "../classes/validacao/RegraFormatoCampo";
import { RegraValidacao } from "../classes/validacao/RegraValidacao";

type Dados = { nome: string; email: string };

const nomeObrigatorio = new RegraCampoObrigatorio<Dados>("nome", "Informe seu nome.");
const emailObrigatorio = new RegraCampoObrigatorio<Dados>("email", "Informe seu e-mail.");
const emailValido = new RegraFormatoCampo<Dados>("email", /^\S+@\S+\.\S+$/, "Informe um e-mail válido.");

describe("GrupoRegrasValidacao (Composite)", () => {
  it("trata uma regra simples e um grupo do mesmo jeito", () => {
    const dados = { nome: "", email: "" };
    const grupoComUmaRegra = new GrupoRegrasValidacao<Dados>([nomeObrigatorio]);

    expect(grupoComUmaRegra.validar(dados)).toEqual(nomeObrigatorio.validar(dados));
  });

  it("reúne os erros de todas as regras", () => {
    const grupo = new GrupoRegrasValidacao<Dados>([nomeObrigatorio, emailObrigatorio]);

    expect(grupo.validar({ nome: "", email: "" })).toEqual({ nome: "Informe seu nome.", email: "Informe seu e-mail." });
  });

  it("aceita grupos dentro de grupos", () => {
    const grupoDeNome = new GrupoRegrasValidacao<Dados>([nomeObrigatorio]);
    const grupoDeEmail = new GrupoRegrasValidacao<Dados>([emailObrigatorio, emailValido]);
    const raiz = new GrupoRegrasValidacao<Dados>([grupoDeNome, grupoDeEmail]);

    expect(raiz.validar({ nome: "", email: "xx" })).toEqual({ nome: "Informe seu nome.", email: "Informe um e-mail válido." });
  });

  it("mantém a mensagem da primeira regra quando duas reprovam o mesmo campo", () => {
    const sempreReprova = new RegraFormatoCampo<Dados>("email", /^$/, "Segunda mensagem.");
    const grupo = new GrupoRegrasValidacao<Dados>([emailValido, sempreReprova]);

    expect(grupo.validar({ nome: "Ana", email: "xx" })).toEqual({ email: "Informe um e-mail válido." });
  });

  it("devolve objeto vazio quando tudo é válido ou o grupo não tem regras", () => {
    expect(new GrupoRegrasValidacao<Dados>([nomeObrigatorio]).validar({ nome: "Ana", email: "" })).toEqual({});
    expect(new GrupoRegrasValidacao<Dados>([]).validar({ nome: "", email: "" })).toEqual({});
  });

  it("aceita uma regra nova sem alterar o grupo (aberto para extensão)", () => {
    class RegraNomeComSobrenome extends RegraValidacao<Dados> {
      validar(dados: Dados) {
        return dados.nome.trim().includes(" ") ? {} : this.erro("nome", "Informe nome e sobrenome.");
      }
    }
    const grupo = new GrupoRegrasValidacao<Dados>([new RegraNomeComSobrenome()]);

    expect(grupo.validar({ nome: "Ana", email: "" })).toEqual({ nome: "Informe nome e sobrenome." });
    expect(grupo.validar({ nome: "Ana Lima", email: "" })).toEqual({});
  });
});
