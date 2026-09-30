import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const base = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const api = process.env.TEST_API_URL ?? "http://localhost:8081";
const output = path.resolve("coverage/search-results");
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true, channel: process.env.TEST_BROWSER_CHANNEL || "msedge" });
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error" && /unique.*key|hydration|hydrated/i.test(message.text())) errors.push(message.text());
});

try {
  // Exercise the actual updated mock before using controlled fixtures.
  await page.route("**/api/**", async (route) => {
    const response = await route.fetch({ url: api + new URL(route.request().url()).pathname });
    await route.fulfill({ response });
  });
  await page.goto(base + "/viagens");
  await page.waitForLoadState("networkidle");
  await page.getByText("25 viagens encontradas", { exact: true }).waitFor();
  assert.equal(await page.locator(".viagem-card").count(), 25);
  assert.ok((await page.locator(".viagem-card").first().innerText()).includes("Sobral"));
  await page.screenshot({ path: path.join(output, "busca-mock-real.png"), fullPage: true });
  await page.unroute("**/api/**");

  const cidades = [
    { id: 1, nome: "São Paulo", uf: "SP" },
    { id: 2, nome: "Rio de Janeiro", uf: "RJ" },
  ];
  const assentos = Array.from({ length: 8 }, (_, index) => ({ id: index + 1, onibusId: 1, numero: index + 1 }));
  const horarios = [["07:30", "13:50"], ["08:15", "14:45"], ["11:00", "17:15"], ["22:30", "04:50"], ["23:15", "05:35"]];
  const viagens = horarios.map(([partida, chegada], index) => ({
    id: index + 1,
    onibusId: 1,
    origemId: 1,
    destinoId: 2,
    classe: index % 2 ? "CONVENCIONAL" : "EXECUTIVA",
    partidaEm: "2099-10-15T" + partida + ":00-03:00",
    chegadaEm: (index >= 3 ? "2099-10-16T" : "2099-10-15T") + chegada + ":00-03:00",
    precoCentavos: [8990, 9400, 15900, 10450, 16800][index],
    status: "AGENDADA",
  }));
  viagens.push(
    { ...viagens[0], id: 6, status: "CANCELADA" },
    { ...viagens[0], id: 7, status: "COMPLETADA" },
    { ...viagens[0], id: 8, partidaEm: "2000-01-01T08:00:00-03:00" },
    { ...viagens[0], id: 9 },
  );
  const disponibilidades = viagens.flatMap((viagem) => assentos.map((assento) => ({
    id: viagem.id * 100 + assento.id,
    viagemId: viagem.id,
    assentoId: assento.id,
    status: viagem.id === 9 || assento.id === 1 ? "RESERVADO" : assento.id === 2 ? "SEGURADO" : "DISPONIVEL",
    reservaId: assento.id <= 2 ? 1 : null,
  })));
  let falhar = false;
  let conflito = false;
  await page.route("**/api/**", async (route) => {
    const recurso = new URL(route.request().url()).pathname.split("/").pop();
    if (falhar && recurso === "viagens") {
      await route.fulfill({ status: 500, contentType: "application/json", body: "{}" });
      return;
    }
    const dados = {
      cidades,
      assentos,
      viagens,
      viagens_assentos: disponibilidades.map((item) => conflito && item.viagemId === 1 && item.assentoId === 4 ? { ...item, status: "SEGURADO" } : item),
    };
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(dados[recurso] ?? []) });
  });

  const busca = "/viagens?origem=Sao%20Paulo&destino=Rio%20de%20Janeiro&partida=2099-10-15&passageiros=1";
  await page.goto(base + busca);
  await page.waitForLoadState("networkidle");
  await page.getByText("5 viagens encontradas", { exact: true }).waitFor();
  assert.equal(await page.locator(".viagem-card").first().getAttribute("aria-label"), "Viagem 1");
  await page.screenshot({ path: path.join(output, "search-results-desktop.png"), fullPage: true });

  await page.getByRole("button", { name: "Menor duração", exact: true }).click();
  assert.equal(await page.locator(".viagem-card").first().getAttribute("aria-label"), "Viagem 3");
  await page.getByRole("button", { name: "Saída mais cedo", exact: true }).click();
  assert.equal(await page.locator(".viagem-card").first().getAttribute("aria-label"), "Viagem 1");
  await page.getByRole("checkbox", { name: /Noite/ }).check();
  assert.equal(await page.locator(".viagem-card").count(), 2);
  await page.getByRole("checkbox", { name: /Executiva/ }).check();
  assert.equal(await page.locator(".viagem-card").count(), 1);
  await page.getByRole("button", { name: "LIMPAR TUDO", exact: true }).click();
  assert.equal(await page.locator(".viagem-card").count(), 5);
  await page.getByRole("slider", { name: "Preço máximo" }).evaluate((input) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, "9500");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await page.getByText("2 viagens encontradas", { exact: true }).waitFor();
  await page.getByRole("button", { name: "LIMPAR TUDO", exact: true }).click();
  await page.getByRole("checkbox", { name: /Madrugada/ }).check();
  await page.getByRole("heading", { name: "Nenhuma viagem encontrada" }).waitFor();
  await page.getByRole("button", { name: "LIMPAR TUDO", exact: true }).click();

  await page.getByRole("button", { name: "Editar busca", exact: true }).click();
  await page.getByRole("combobox", { name: "Origem", exact: true }).fill("Cidade inexistente");
  await page.getByRole("button", { name: "Buscar viagens", exact: true }).click();
  await page.getByRole("heading", { name: "Nenhuma viagem encontrada" }).waitFor();

  await page.goto(base + busca);
  await page.getByText("5 viagens encontradas", { exact: true }).waitFor();
  await page.locator(".viagem-card").first().getByRole("link", { name: "Selecionar", exact: true }).click();
  await page.getByRole("heading", { name: "Selecione sua poltrona" }).waitFor();
  assert.equal(await page.getByRole("button", { name: "Poltrona 1, indisponível", exact: true }).isDisabled(), true);
  assert.equal(await page.getByRole("button", { name: "Poltrona 2, indisponível", exact: true }).isDisabled(), true);
  assert.equal(await page.getByRole("button", { name: "Confirmar seleção", exact: true }).isDisabled(), true);
  await page.getByRole("button", { name: "Poltrona 3, disponível", exact: true }).click();
  assert.equal(await page.getByRole("button", { name: "Poltrona 4, disponível", exact: true }).isDisabled(), true);
  await page.screenshot({ path: path.join(output, "selecao-assento-desktop.png"), fullPage: true });
  await page.getByRole("button", { name: "Poltrona 3, selecionada", exact: true }).click();
  await page.getByRole("button", { name: "Poltrona 4, disponível", exact: true }).click();
  conflito = true;
  await page.getByRole("button", { name: "Confirmar seleção", exact: true }).click();
  await page.getByRole("alert").filter({ hasText: "ficou indisponível" }).waitFor();
  conflito = false;
  await page.getByRole("button", { name: "Poltrona 3, disponível", exact: true }).click();
  await page.getByRole("button", { name: "Confirmar seleção", exact: true }).click();
  await page.getByRole("heading", { name: "Dados dos passageiros" }).waitFor();
  await page.getByLabel("Nome completo").fill("Mariana Silva Oliveira");
  await page.getByLabel("CPF").fill("12345678901");
  await page.getByLabel("Data de nascimento").fill("1990-05-10");
  await page.getByLabel("E-mail").fill("mariana@example.com");
  await page.getByLabel("Celular").fill("11999998888");
  await page.screenshot({ path: path.join(output, "dados-passageiro-desktop.png"), fullPage: true });
  await page.getByRole("button", { name: /Continuar para pagamento/ }).click();
  await page.getByRole("heading", { name: "Forma de pagamento" }).waitFor();
  await page.screenshot({ path: path.join(output, "pagamento-desktop.png"), fullPage: true });
  await page.getByRole("button", { name: /Confirmar pagamento/ }).click();
  await page.getByRole("heading", { name: "Reserva confirmada!" }).waitFor();
  assert.match(await page.locator(".confirmacao-bilhete").innerText(), /Mariana Silva Oliveira/);
  await page.screenshot({ path: path.join(output, "confirmacao-desktop.png"), fullPage: true });

  await page.goto(base + "/viagens/1/assentos?passageiros=2");
  await page.getByRole("button", { name: "Poltrona 3, disponível", exact: true }).click();
  await page.getByRole("button", { name: "Poltrona 4, disponível", exact: true }).click();
  assert.match(await page.locator(".assento-total").innerText(), /179,80/);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(output, "selecao-assento-mobile.png"), fullPage: true });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);

  await page.goto(base + busca);
  await page.getByText("5 viagens encontradas", { exact: true }).waitFor();
  await page.screenshot({ path: path.join(output, "search-results-mobile.png"), fullPage: true });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  for (const image of await page.locator('main img').all()) {
    if (!await image.isVisible()) continue;
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((element) => element.decode());
    assert.equal(await image.evaluate((element) => element.complete && element.naturalWidth > 0), true);
  }

  falhar = true;
  await page.goto(base + "/viagens");
  await page.getByRole("alert").waitFor();
  falhar = false;
  await page.getByRole("button", { name: "Tentar novamente", exact: true }).click();
  await page.getByText("5 viagens encontradas", { exact: true }).waitFor();
  assert.deepEqual(errors, []);
  console.log("PASS: API real, busca, filtros, três ordenações, vazio, erro/retry, seleção, limite, conflito, preço e responsividade.");
} finally {
  await browser.close();
}
