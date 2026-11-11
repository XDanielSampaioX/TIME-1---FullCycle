import { caminhoDoLogin, destinoAposLogin } from "../utils/destinoAposLogin";

describe("destinoAposLogin", () => {
  it.each([
    ["/editar-perfil", "/editar-perfil"],
    ["/viagens?origem=1&destino=2&data=2026-11-10", "/viagens?origem=1&destino=2&data=2026-11-10"],
    ["/viagens/7/assentos?passageiros=2#mapa", "/viagens/7/assentos?passageiros=2#mapa"],
  ])("aceita o caminho interno %s, com a busca preenchida", (voltar, esperado) => {
    expect(destinoAposLogin(voltar)).toBe(esperado);
  });

  it.each([
    ["sem ?voltar=", undefined],
    ["vazio", ""],
    ["repetido na URL", ["/a", "/b"]],
    ["outro site", "https://site-falso.com"],
    ["outro site sem protocolo", "//site-falso.com"],
    ["outro site com barra invertida", "/\\site-falso.com"],
    ["outro site escondido com tabulação", "/\t/site-falso.com"],
    ["javascript:", "javascript:alert(1)"],
    ["caminho relativo", "editar-perfil"],
    ["o próprio login", "/login?voltar=/login"],
  ])("volta para a página inicial quando o valor é %s", (_caso, voltar) => {
    expect(destinoAposLogin(voltar)).toBe("/");
  });
});

describe("caminhoDoLogin", () => {
  it("monta o link do login com o caminho de volta codificado, e o destino lê o mesmo caminho", () => {
    const link = caminhoDoLogin("/viagens?origem=1&destino=2");

    expect(link).toBe("/login?voltar=%2Fviagens%3Forigem%3D1%26destino%3D2");
    expect(destinoAposLogin(new URL(link, "http://localhost").searchParams.get("voltar")!)).toBe("/viagens?origem=1&destino=2");
  });
});
