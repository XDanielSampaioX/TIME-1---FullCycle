import { caminhoDoCadastro, caminhoDoLogin, destinoAposLogin } from "../utils/destinoAposLogin";

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
    ["o próprio login com barra no fim", "/login/"],
    ["o cadastro", "/cadastro?voltar=/editar-perfil"],
    ["o cadastro com barra no fim", "/cadastro/"],
    ["endereço malformado com colchete", "//["],
    ["endereço malformado com espaço", "//a b"],
    ["endereço malformado com IPv6 incompleto", "//[::1"],
    ["outro site depois de normalizar /./", "/.//evil.com"],
    ["outro site depois de normalizar /../", "/..//evil.com"],
    ["outro site depois de normalizar /a/../", "/a/..//evil.com"],
    ["outro site depois de normalizar %2e%2e", "/%2e%2e//evil.com"],
    ["outro site com ./ e barra invertida", "/.\\/evil.com"],
    ["o exemplo do Daniel", "/.//localhost:8000/api/v1/me/"],
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

describe("caminhoDoCadastro", () => {
  it("monta o link do cadastro com o caminho de volta codificado, e o destino lê o mesmo caminho", () => {
    const link = caminhoDoCadastro("/viagens/7/assentos?passageiros=2");

    expect(link).toBe("/cadastro?voltar=%2Fviagens%2F7%2Fassentos%3Fpassageiros%3D2");
    expect(destinoAposLogin(new URL(link, "http://localhost").searchParams.get("voltar")!)).toBe("/viagens/7/assentos?passageiros=2");
  });
});
