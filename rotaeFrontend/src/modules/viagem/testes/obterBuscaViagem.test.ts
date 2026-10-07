import { obterBuscaViagem } from "../utils/obterBuscaViagem";

describe("obterBuscaViagem", () => {
  it("remove espaços dos campos e converte uma quantidade válida de passageiros", () => {
    expect(obterBuscaViagem({
      origem: " Fortaleza ",
      destino: " Sobral ",
      partida: " 2026-10-05 ",
      passageiros: "2",
    })).toEqual({
      origem: "Fortaleza",
      destino: "Sobral",
      partida: "2026-10-05",
      passageiros: 2,
    });
  });

  it.each(["1", "2", "3", "4"])(
    "aceita %s passageiro(s)",
    (passageiros) => {
      expect(obterBuscaViagem({ passageiros }).passageiros).toBe(Number(passageiros));
    },
  );

  it.each(["0", "5", "1.5", "-1", "abc"])(
    "ignora a quantidade inválida %s",
    (passageiros) => {
      expect(obterBuscaViagem({ passageiros }).passageiros).toBeUndefined();
    },
  );

  it("usa texto vazio para parâmetros ausentes ou que não sejam strings simples", () => {
    expect(obterBuscaViagem({ origem: ["Fortaleza"], destino: undefined, partida: ["2026-10-05"] })).toEqual({
      origem: "",
      destino: "",
      partida: "",
      passageiros: undefined,
    });
  });
});
