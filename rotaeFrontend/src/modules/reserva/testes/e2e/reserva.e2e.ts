import { expect, test, type APIRequestContext, type Browser, type Page } from "@playwright/test";

// Fluxo completo de reserva com duas pessoas, no frontend e no backend de verdade.
// Precisa de duas contas de teste, informadas por variáveis de ambiente:
// E2E_EMAIL_A, E2E_SENHA_A, E2E_EMAIL_B e E2E_SENHA_B. E2E_API_URL aponta para o backend.

const API = `${process.env.E2E_API_URL ?? "http://localhost:8000"}/api/v1`;
const contas = {
  a: { email: process.env.E2E_EMAIL_A ?? "", senha: process.env.E2E_SENHA_A ?? "" },
  b: { email: process.env.E2E_EMAIL_B ?? "", senha: process.env.E2E_SENHA_B ?? "" },
};

type Sessao = { access: string; refresh: string; usuario: unknown };
type AssentoDaViagem = { id: number; numero: number; status: string };
type ReservaResumo = { id: number; status: string; assentos: { numero: number }[] };

test.describe.configure({ mode: "serial" });
test.skip(!contas.a.email || !contas.b.email, "Defina as contas de teste E2E_EMAIL_A/B e E2E_SENHA_A/B.");

async function entrar(request: APIRequestContext, conta: typeof contas.a): Promise<Sessao> {
  const resposta = await request.post(`${API}/auth/login/`, { data: { email: conta.email, senha: conta.senha } });
  expect(resposta.ok()).toBeTruthy();
  const { access, refresh, user } = await resposta.json();
  return { access, refresh, usuario: user };
}

async function abrirComo(browser: Browser, sessao: Sessao) {
  const contexto = await browser.newContext();
  await contexto.addInitScript((valor) => localStorage.setItem("rotae.sessao", valor), JSON.stringify(sessao));
  return contexto.newPage();
}

function poltrona(pagina: Page, numero: number) {
  return pagina.getByRole("button", { name: new RegExp(`^Poltrona ${numero},`) });
}

// O Next também usa role="alert" para anunciar a troca de rota; o aviso da seleção fica no resumo.
function aviso(pagina: Page) {
  return pagina.locator(".assento-resumo").getByRole("alert");
}

async function minhasReservas(request: APIRequestContext, sessao: Sessao) {
  const reservas: ReservaResumo[] = [];
  for (let pagina = 1; ; pagina += 1) {
    const resposta = await request.get(`${API}/me/reservas/?page=${pagina}`, { headers: { Authorization: `Bearer ${sessao.access}` } });
    const corpo = await resposta.json();
    reservas.push(...corpo.results);
    if (!corpo.next) return reservas;
  }
}

async function abertas(request: APIRequestContext, sessao: Sessao) {
  return (await minhasReservas(request, sessao)).filter((reserva) => reserva.status === "PAGAMENTO_PENDENTE");
}

let sessaoA: Sessao;
let sessaoB: Sessao;
let viagemId: number;
let livres: number[];

test.beforeAll(async ({ request }) => {
  sessaoA = await entrar(request, contas.a);
  sessaoB = await entrar(request, contas.b);

  // Usa a primeira viagem futura com poltronas suficientes para o teste.
  const viagens = await (await request.get(`${API}/viagens/?page_size=50`)).json();
  const viagem = viagens.results.find((item: { assentosLivres: number }) => item.assentosLivres >= 15);
  expect(viagem, "nenhuma viagem com 15 poltronas livres").toBeTruthy();
  viagemId = viagem.id;

  const assentos = await (await request.get(`${API}/viagens/${viagemId}/assentos/`)).json();
  const lista: AssentoDaViagem[] = Array.isArray(assentos) ? assentos : assentos.results;
  livres = lista.filter((assento) => assento.status === "DISPONIVEL").map((assento) => assento.numero);
});

// Devolve as poltronas que algum teste tenha deixado seguradas.
test.afterEach(async ({ request }) => {
  for (const sessao of [sessaoA, sessaoB]) {
    for (const reserva of await abertas(request, sessao)) {
      await request.post(`${API}/reservas/${reserva.id}/cancelar/`, { headers: { Authorization: `Bearer ${sessao.access}` } });
    }
  }
});

test("escolher não reserva; a primeira a confirmar fica com a poltrona", async ({ browser, request }) => {
  const paginaA = await abrirComo(browser, sessaoA);
  const paginaB = await abrirComo(browser, sessaoB);
  await paginaA.goto(`/viagens/${viagemId}/assentos`);
  await paginaB.goto(`/viagens/${viagemId}/assentos`);

  const [primeira, segunda] = livres;
  await poltrona(paginaA, primeira).click();
  await poltrona(paginaB, primeira).click();
  await poltrona(paginaB, segunda).click();
  await expect(poltrona(paginaA, primeira)).toHaveAttribute("aria-pressed", "true");
  await expect(poltrona(paginaB, primeira)).toHaveAttribute("aria-pressed", "true");

  // A seleção fica só na tela: nenhuma reserva é criada antes de confirmar.
  expect(await abertas(request, sessaoA)).toHaveLength(0);
  expect(await abertas(request, sessaoB)).toHaveLength(0);

  await paginaA.getByRole("button", { name: "Confirmar seleção" }).click();
  await expect(paginaA).toHaveURL(/\/reservas\/\d+\/passageiros$/);

  // Quem confirma depois recebe o 409: perde só a poltrona tomada e o mapa mostra ela ocupada.
  await paginaB.getByRole("button", { name: "Confirmar seleção" }).click();
  await expect(aviso(paginaB)).toHaveText("Outra pessoa acabou de escolher uma das poltronas. Escolha outra.");
  await expect(poltrona(paginaB, primeira)).toBeDisabled();
  await expect(poltrona(paginaB, segunda)).toHaveAttribute("aria-pressed", "true");

  expect(await abertas(request, sessaoB)).toHaveLength(0);
  const [reservaA] = await abertas(request, sessaoA);
  expect(reservaA.assentos.map((assento) => assento.numero)).toEqual([primeira]);
});

test("quem não entrou escolhe, faz login ao confirmar e volta com as mesmas poltronas", async ({ browser, request }) => {
  const pagina = await (await browser.newContext()).newPage();
  await pagina.goto(`/viagens/${viagemId}/assentos`);
  await poltrona(pagina, livres[2]).click();
  await poltrona(pagina, livres[3]).click();

  await pagina.getByRole("button", { name: "Confirmar seleção" }).click();
  await expect(pagina).toHaveURL(/\/login\?retorno=/);

  await pagina.locator('input[name="email"]').fill(contas.b.email);
  await pagina.locator('input[name="senha"]').fill(contas.b.senha);
  await pagina.getByRole("button", { name: "Entrar" }).click();

  await expect(pagina).toHaveURL(new RegExp(`/viagens/${viagemId}/assentos[?]`));
  await expect(poltrona(pagina, livres[2])).toHaveAttribute("aria-pressed", "true");
  await expect(poltrona(pagina, livres[3])).toHaveAttribute("aria-pressed", "true");
  expect(await abertas(request, sessaoB)).toHaveLength(0);
});

test("respeita o limite de 10, confirma e cancela pela tela", async ({ browser, request }) => {
  const pagina = await abrirComo(browser, sessaoA);
  await pagina.goto(`/viagens/${viagemId}/assentos`);

  const escolhidas = livres.slice(0, 10);
  for (const numero of escolhidas) {
    await poltrona(pagina, numero).click();
    await expect(poltrona(pagina, numero)).toHaveAttribute("aria-pressed", "true");
    await expect(poltrona(pagina, numero)).toBeEnabled();
  }

  await poltrona(pagina, livres[10]).click();
  await expect(aviso(pagina)).toHaveText("Você pode reservar até 10 poltronas.");
  await expect(poltrona(pagina, livres[10])).toHaveAttribute("aria-pressed", "false");

  await pagina.getByRole("button", { name: "Confirmar seleção" }).click();
  await expect(pagina).toHaveURL(/\/reservas\/\d+\/passageiros$/);
  await expect(pagina.getByRole("group", { name: /^Passageiro/ })).toHaveCount(10);

  const [reserva] = await abertas(request, sessaoA);
  expect(reserva.assentos).toHaveLength(10);

  // Sem passageiros, a reserva continua em Minhas viagens com o atalho para informá-los.
  await pagina.goto("/minhas-viagens");
  const codigo = `Reserva #ROT-${new Date().getFullYear()}-${String(reserva.id).padStart(4, "0")}`;
  const cartao = pagina.getByRole("article", { name: codigo });
  await expect(cartao).toContainText("Aguardando pagamento");
  await expect(cartao.getByRole("link", { name: "Informar passageiros" })).toHaveAttribute("href", `/reservas/${reserva.id}/passageiros`);

  await cartao.getByRole("button", { name: "Cancelar" }).click();
  await cartao.getByRole("button", { name: "Sim, cancelar" }).click();
  // Na aba Todas, o cartão continua na lista, agora como cancelado.
  await expect(cartao).toContainText("Reserva cancelada");
  expect(await abertas(request, sessaoA)).toHaveLength(0);
});

test("informa os passageiros depois de escolher as poltronas", async ({ browser, request }) => {
  const pagina = await abrirComo(browser, sessaoB);
  await pagina.goto(`/viagens/${viagemId}/assentos`);

  const escolhidas = livres.slice(11, 13).sort((x, y) => x - y);
  for (const numero of escolhidas) {
    await poltrona(pagina, numero).click();
    await expect(poltrona(pagina, numero)).toHaveAttribute("aria-pressed", "true");
    await expect(poltrona(pagina, numero)).toBeEnabled();
  }

  await pagina.getByRole("button", { name: "Confirmar seleção" }).click();
  await expect(pagina).toHaveURL(/\/reservas\/\d+\/passageiros$/);

  // CPFs válidos de exemplo; o backend confere os dígitos verificadores.
  const pessoas = [
    { nome: "Joana Teste", cpf: "52998224725", dataNasc: "1995-04-20", celular: "85999990000", email: "joana@teste.com" },
    { nome: "Pedro Teste", cpf: "11144477735", dataNasc: "1996-05-15", celular: "85988880000", email: "pedro@teste.com" },
  ];
  for (const [indice, pessoa] of pessoas.entries()) {
    // O primeiro card é o da menor poltrona escolhida.
    const bloco = pagina.getByRole("group", { name: `Passageiro ${indice + 1}, poltrona ${escolhidas[indice]}` });
    await bloco.getByLabel("Nome completo").fill(pessoa.nome);
    await bloco.getByLabel("CPF").fill(pessoa.cpf);
    await bloco.getByLabel("Data de nascimento").fill(pessoa.dataNasc);
    await bloco.getByLabel("Celular").fill(pessoa.celular);
    await bloco.getByLabel("E-mail").fill(pessoa.email);
  }

  // O pagamento é pulado por enquanto: depois dos passageiros vem a confirmação com o bilhete.
  await pagina.getByRole("button", { name: "Confirmar reserva" }).click();
  await expect(pagina).toHaveURL(/\/reservas\/\d+\/confirmacao$/);
  await expect(pagina.getByRole("heading", { level: 1, name: "Reserva confirmada!" })).toBeVisible();
  // Um bilhete por passageiro, cada um com o seu QR Code.
  await expect(pagina.getByRole("img", { name: /^QR Code da passagem/ })).toHaveCount(2);
  await expect(pagina.getByText("Joana Teste")).toBeVisible();
  await expect(pagina.getByText("Pedro Teste")).toBeVisible();

  // Em Minhas viagens, o detalhe da reserva é o mesmo bilhete da confirmação.
  await pagina.getByRole("link", { name: "Ver minhas viagens" }).click();
  await expect(pagina).toHaveURL(/\/minhas-viagens$/);
  const [reserva] = await abertas(request, sessaoB);
  const codigo = `Reserva #ROT-${new Date().getFullYear()}-${String(reserva.id).padStart(4, "0")}`;
  const cartao = pagina.getByRole("article", { name: codigo });
  await expect(cartao).toContainText("Joana Teste e Pedro Teste");

  await cartao.getByRole("button", { name: "Ver 2 bilhetes" }).click();
  const modal = pagina.getByRole("dialog", { name: "Detalhes da reserva" });
  await expect(modal.getByRole("heading", { name: "Reserva confirmada!" })).toBeVisible();
  await expect(modal.getByRole("img", { name: /^QR Code da passagem/ })).toHaveCount(2);
});
