import { usuario } from "@/modules/usuario/testes/fixtures/usuario";
import { atualizarSessao, lerSessao, removerSessao, salvarSessao } from "../utils/sessaoSalva";

const CHAVE = "rotae.sessao";
const sessao = { access: "a", refresh: "r", user: usuario };
const teste1 = { access: "a1", refresh: "r1", user: { ...usuario, id: 1, nome: "Teste 1" } };
const teste2 = { access: "a2", refresh: "r2", user: { ...usuario, id: 2, nome: "Teste 2" } };

// Duas abas do mesmo navegador: o localStorage é um só para as duas, e cada aba tem o seu sessionStorage.
function criarAbas() {
  const guardadas: Record<"A" | "B", string | null> = { A: null, B: null };
  let atual: "A" | "B" = "A";

  return function irPara(aba: "A" | "B") {
    guardadas[atual] = sessionStorage.getItem(CHAVE);
    sessionStorage.clear();
    const daAba = guardadas[aba];
    if (daAba !== null) sessionStorage.setItem(CHAVE, daAba);
    atual = aba;
  };
}

describe("sessão salva", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe("Lembrar de mim", () => {
    it("marcado: guarda a sessão no localStorage, que continua ao fechar o navegador", () => {
      salvarSessao(sessao, true);

      expect(localStorage.getItem(CHAVE)).not.toBeNull();
      expect(sessionStorage.getItem(CHAVE)).toBeNull();
      expect(lerSessao()).toEqual(sessao);
    });

    it("desmarcado: guarda a sessão no sessionStorage, que o navegador apaga ao fechar a aba", () => {
      salvarSessao(sessao, false);

      expect(sessionStorage.getItem(CHAVE)).not.toBeNull();
      expect(localStorage.getItem(CHAVE)).toBeNull();
      expect(lerSessao()).toEqual(sessao);
    });

    it("um login novo nesta aba substitui a sessão anterior desta aba", () => {
      salvarSessao({ ...sessao, access: "da-pessoa-anterior" }, false);

      salvarSessao(sessao, true);

      expect(sessionStorage.getItem(CHAVE)).toBeNull();
      expect(lerSessao()).toEqual(sessao);
    });
  });

  describe("atualizarSessao", () => {
    it("troca só os campos informados e mantém o resto", () => {
      salvarSessao(sessao, true);

      atualizarSessao({ access: "novo-a", refresh: "novo-r" }, usuario.id);

      expect(lerSessao()).toEqual({ ...sessao, access: "novo-a", refresh: "novo-r" });
    });

    it.each([true, false])("mantém a sessão na mesma guarda (lembrar = %s)", (lembrar) => {
      salvarSessao(sessao, lembrar);

      atualizarSessao({ user: { ...usuario, nome: "Outro" } }, usuario.id);

      const guarda = lembrar ? localStorage : sessionStorage;
      const outra = lembrar ? sessionStorage : localStorage;
      expect(JSON.parse(guarda.getItem(CHAVE)!).user.nome).toBe("Outro");
      expect(outra.getItem(CHAVE)).toBeNull();
    });

    it("não recria uma sessão que já foi encerrada", () => {
      atualizarSessao({ access: "novo-a" }, usuario.id);

      expect(lerSessao()).toBeNull();
    });

    it("avisa as outras partes da tela de que a sessão mudou", () => {
      salvarSessao(sessao, true);
      const aoMudar = jest.fn();
      window.addEventListener("storage", aoMudar);

      atualizarSessao({ access: "novo-a" }, usuario.id);

      expect(aoMudar).toHaveBeenCalledTimes(1);
      window.removeEventListener("storage", aoMudar);
    });
  });

  describe("duas abas no mesmo navegador", () => {
    it("A sem lembrar e B com lembrar: cada aba continua com o próprio usuário, mesmo depois de B sair", () => {
      const irPara = criarAbas();

      irPara("A");
      salvarSessao(teste1, false);
      irPara("B");
      salvarSessao(teste2, true);

      irPara("A");
      expect(lerSessao()?.user.nome).toBe("Teste 1");

      irPara("B");
      removerSessao();
      expect(lerSessao()).toBeNull();
      irPara("A");
      expect(lerSessao()?.user.nome).toBe("Teste 1");
    });

    it("A com lembrar e B sem lembrar: o login de B não desloga A", () => {
      const irPara = criarAbas();

      irPara("A");
      salvarSessao(teste1, true);
      irPara("B");
      salvarSessao(teste2, false);

      irPara("A");
      expect(lerSessao()?.user.nome).toBe("Teste 1");
      irPara("B");
      expect(lerSessao()?.user.nome).toBe("Teste 2");
    });

    it("tokens renovados para um usuário não são gravados sobre a sessão de outro", () => {
      const irPara = criarAbas();

      irPara("A");
      salvarSessao(teste1, true);
      // Enquanto A renova os tokens de teste 1, B entra como teste 2 lembrado.
      irPara("B");
      salvarSessao(teste2, true);
      irPara("A");
      atualizarSessao({ access: "novo-de-teste-1", refresh: "novo-r1" }, teste1.user.id);

      expect(lerSessao()).toEqual(teste2);
    });
  });

  describe("sessão corrompida", () => {
    it.each([
      ["JSON inválido", "{x}"],
      ["objeto vazio", "{}"],
      ["sem usuário", '{"access":"a","refresh":"r"}'],
      ["texto solto", '"oi"'],
      ["null", "null"],
    ])("%s: lerSessao devolve null e apaga o valor, sem quebrar", (_caso, valor) => {
      sessionStorage.setItem(CHAVE, valor);
      localStorage.setItem(CHAVE, valor);

      expect(lerSessao()).toBeNull();
      expect(sessionStorage.getItem(CHAVE)).toBeNull();
      expect(localStorage.getItem(CHAVE)).toBeNull();
    });
  });

  it("removerSessao apaga a sessão das duas guardas", () => {
    localStorage.setItem(CHAVE, JSON.stringify(sessao));
    sessionStorage.setItem(CHAVE, JSON.stringify(sessao));

    removerSessao();

    expect(localStorage.getItem(CHAVE)).toBeNull();
    expect(sessionStorage.getItem(CHAVE)).toBeNull();
  });
});
