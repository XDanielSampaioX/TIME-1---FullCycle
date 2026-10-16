import { formatarDataNascimento } from "../utils/formatarDataNascimento";

describe("formatarDataNascimento", () => {
  it("converte AAAA-MM-DD em DD/MM/AAAA", () => {
    expect(formatarDataNascimento("1995-04-20")).toBe("20/04/1995");
  });

  it("avisa quando a data não foi informada", () => {
    expect(formatarDataNascimento("")).toBe("Não informada");
    expect(formatarDataNascimento(null)).toBe("Não informada");
  });
});
