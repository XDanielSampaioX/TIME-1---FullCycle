import { apenasDigitos, mascararCampo, mascararCelular, mascararCpf } from "../utils/mascaras";

describe("apenasDigitos", () => {
  it("tira tudo o que não é número", () => {
    expect(apenasDigitos("529.982.247-25")).toBe("52998224725");
    expect(apenasDigitos("(85) 99999-0000")).toBe("85999990000");
  });
});

describe("mascararCpf", () => {
  it.each([
    ["", ""],
    ["5", "5"],
    ["529", "529"],
    ["5299", "529.9"],
    ["529982", "529.982"],
    ["5299822", "529.982.2"],
    ["529982247", "529.982.247"],
    ["5299822472", "529.982.247-2"],
    ["52998224725", "529.982.247-25"],
  ])("monta a máscara enquanto digita: %s → %s", (digitado, esperado) => {
    expect(mascararCpf(digitado)).toBe(esperado);
  });

  it("aceita texto colado com outros caracteres e corta no 11º dígito", () => {
    expect(mascararCpf(" 529 982 247 25 ")).toBe("529.982.247-25");
    expect(mascararCpf("529982247259999")).toBe("529.982.247-25");
  });

  it("apagar o último caractere não trava a máscara (backspace)", () => {
    expect(mascararCpf("529.982.247-2")).toBe("529.982.247-2");
    expect(mascararCpf("529.982.247-")).toBe("529.982.247");
    expect(mascararCpf("529.")).toBe("529");
  });

  it("aplicar duas vezes dá o mesmo resultado", () => {
    expect(mascararCpf(mascararCpf("52998224725"))).toBe("529.982.247-25");
  });
});

describe("mascararCelular", () => {
  it.each([
    ["", ""],
    ["8", "8"],
    ["85", "85"],
    ["859", "(85) 9"],
    ["8599999", "(85) 99999"],
    ["85999990", "(85) 99999-0"],
    ["85999990000", "(85) 99999-0000"],
  ])("celular enquanto digita: %s → %s", (digitado, esperado) => {
    expect(mascararCelular(digitado)).toBe(esperado);
  });

  it("telefone fixo tem 10 dígitos e hífen depois do quarto", () => {
    expect(mascararCelular("8533334444")).toBe("(85) 3333-4444");
    expect(mascararCelular("85333344449")).toBe("(85) 3333-4444");
  });

  it("aceita texto colado, apagar e aplicar duas vezes", () => {
    expect(mascararCelular("+55 85 99999 0000".slice(4))).toBe("(85) 99999-0000");
    expect(mascararCelular("(85) 99999-")).toBe("(85) 99999");
    expect(mascararCelular(mascararCelular("85999990000"))).toBe("(85) 99999-0000");
  });
});

describe("mascararCampo", () => {
  it("só CPF e celular ganham máscara", () => {
    expect(mascararCampo("cpf", "52998224725")).toBe("529.982.247-25");
    expect(mascararCampo("celular", "85999990000")).toBe("(85) 99999-0000");
    expect(mascararCampo("nome", "João 123")).toBe("João 123");
    expect(mascararCampo("email", "joao@email.com")).toBe("joao@email.com");
  });
});
