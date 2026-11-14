import { usuario } from "@/modules/usuario/testes/fixtures/usuario";
import { atualizarSessao, lerSessao, removerSessao, salvarSessao } from "../utils/sessaoSalva";

const CHAVE = "rotae.sessao";
const sessao = { access: "a", refresh: "r", user: usuario };

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

    it("um login novo apaga a sessão anterior das duas guardas", () => {
      salvarSessao({ ...sessao, access: "da-pessoa-anterior" }, true);

      salvarSessao(sessao, false);

      expect(localStorage.getItem(CHAVE)).toBeNull();
      expect(lerSessao()).toEqual(sessao);
    });
  });

  describe("atualizarSessao", () => {
    it("troca só os campos informados e mantém o resto", () => {
      salvarSessao(sessao, true);

      atualizarSessao({ access: "novo-a", refresh: "novo-r" });

      expect(lerSessao()).toEqual({ ...sessao, access: "novo-a", refresh: "novo-r" });
    });

    it.each([true, false])("mantém a sessão na mesma guarda (lembrar = %s)", (lembrar) => {
      salvarSessao(sessao, lembrar);

      atualizarSessao({ user: { ...usuario, nome: "Outro" } });

      const guarda = lembrar ? localStorage : sessionStorage;
      const outra = lembrar ? sessionStorage : localStorage;
      expect(JSON.parse(guarda.getItem(CHAVE)!).user.nome).toBe("Outro");
      expect(outra.getItem(CHAVE)).toBeNull();
    });

    it("não recria uma sessão que já foi encerrada", () => {
      atualizarSessao({ access: "novo-a" });

      expect(lerSessao()).toBeNull();
    });

    it("avisa as outras partes da tela de que a sessão mudou", () => {
      salvarSessao(sessao, true);
      const aoMudar = jest.fn();
      window.addEventListener("storage", aoMudar);

      atualizarSessao({ access: "novo-a" });

      expect(aoMudar).toHaveBeenCalledTimes(1);
      window.removeEventListener("storage", aoMudar);
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
