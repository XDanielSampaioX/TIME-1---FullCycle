import { usuario } from "@/modules/usuario/testes/fixtures/usuario";
import { atualizarSessao, lerSessao, salvarSessao } from "../utils/sessaoSalva";

describe("atualizarSessao", () => {
  beforeEach(() => localStorage.clear());

  it("troca só os campos informados e mantém o resto", () => {
    salvarSessao({ access: "a", refresh: "r", user: usuario });

    atualizarSessao({ access: "novo-a", refresh: "novo-r" });

    expect(lerSessao()).toEqual({ access: "novo-a", refresh: "novo-r", user: usuario });
  });

  it("troca o usuário sem mexer nos tokens", () => {
    salvarSessao({ access: "a", refresh: "r", user: usuario });

    atualizarSessao({ user: { ...usuario, nome: "Outro" } });

    expect(lerSessao()).toEqual({ access: "a", refresh: "r", user: { ...usuario, nome: "Outro" } });
  });

  it("não recria uma sessão que já foi encerrada", () => {
    atualizarSessao({ access: "novo-a" });

    expect(lerSessao()).toBeNull();
  });

  it("avisa as outras partes da tela de que a sessão mudou", () => {
    salvarSessao({ access: "a", refresh: "r", user: usuario });
    const aoMudar = jest.fn();
    window.addEventListener("storage", aoMudar);

    atualizarSessao({ access: "novo-a" });

    expect(aoMudar).toHaveBeenCalledTimes(1);
    window.removeEventListener("storage", aoMudar);
  });
});
