# Bilhetes por passagem — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A reserva paga mostra um carrossel paginado com um bilhete por passagem, carregado de `GET /api/v1/passagens/<id>/`; a reserva não paga mostra um bloco único; a `Paginacao` compartilhada ganha o sinal de bloqueio.

**Architecture:** `ConfirmacaoReserva` (usado na confirmação e no modal de Minhas viagens) escolhe entre `CarrosselPassagens` (paga) e `BilheteReserva` (não paga). O carrossel percorre `reserva.passagens` (ids do detalhe da reserva) e busca só a passagem da página atual, reaproveitando `useCarregarDados` e `Paginacao`.

**Tech Stack:** Next.js + React + TypeScript, Jest + Testing Library, Playwright (e2e), `qrcode.react`.

**Spec:** `docs/superpowers/specs/2026-11-18-bilhetes-por-passagem-design.md`

## Global Constraints

- Só `rotaeFrontend`; backend intocado. JSON da API em camelCase.
- Bilhete pago usa só campos de `PassagemSerializer`: `id, reservaId, viagem{origem,destino,partidaEm,chegadaEm}, viagemAssento{id,numero}, passageiro, status, criadoEm, atualizadoEm`. Sem classe, sem valor.
- Código e QR do bilhete pago: `formatarCodigoReserva({ id: passagem.id, criadoEm: passagem.criadoEm })`; rótulo do QR: `QR Code da passagem <código>`.
- Resumo do carrossel: `Passagem <i> de <N>`. Estado vazio: `Nenhuma passagem emitida para esta reserva.`
- Botão desabilitado da `Paginacao`: `cursor: not-allowed` e opacidade reduzida.
- Textos e comentários em português, código simples; reaproveitar CSS `reserva-bilhete*` existente.

## Review Focus

- Trocar de página com resposta lenta: o bilhete anterior não pode ficar na tela como se fosse o novo (usar `key` por passagem) — teste no Task 3.
- Falha ao buscar uma passagem: mostra `AvisoDeErro` com "Tentar novamente" só daquela página, sem derrubar o modal — teste no Task 3.
- Reserva com 1 passagem: sem navegação (Paginacao retorna `null`) — teste no Task 3.
- Passagem `CANCELADO` vinda do backend: bilhete mostra o status, sem QR de embarque — teste no Task 3.
- Primeira/última página: botão correspondente `disabled` — teste no Task 1.

---

### Task 1: Paginacao com bloqueio e rótulo configurável

**Files:**
- Modify: `rotaeFrontend/src/shared/components/Paginacao.tsx`, `rotaeFrontend/src/shared/types/pagina.ts`, `rotaeFrontend/src/shared/styles/Paginacao.module.css`
- Test: `rotaeFrontend/src/shared/testes/Paginacao.test.tsx` (criar)

**Interfaces:**
- Produces: `PaginacaoProps` ganha `rotulo?: string` (default `"Paginação dos resultados"`), usado no `aria-label` do `<nav>`.

- [ ] **Step 1:** Teste `desabilita Anterior na primeira página e Próxima na última`: com `anterior={null} proxima="2"` → botão "Anterior" `toBeDisabled()`, "Próxima" habilitado; inverso com `anterior="1" proxima={null}`. Teste `usa o rótulo informado`: `rotulo="Passagens da reserva"` → `getByRole("navigation", { name: "Passagens da reserva" })`.
- [ ] **Step 2:** `npx jest src/shared/testes/Paginacao.test.tsx` → FAIL no rótulo.
- [ ] **Step 3:** Adicionar `rotulo`; no CSS `.controles button:disabled { cursor: not-allowed; opacity: .55; }`.
- [ ] **Step 4:** Rodar de novo → PASS. `npx jest src/modules/viagem src/modules/reserva` continua verde.
- [ ] **Step 5:** Commit `feat(frontend): bloqueio visual na paginação compartilhada`.

### Task 2: Tipo e serviço da passagem

**Files:**
- Create: `rotaeFrontend/src/modules/reserva/types/passagem.ts`, `rotaeFrontend/src/modules/reserva/services/buscarPassagem.ts`
- Modify: `rotaeFrontend/src/modules/reserva/types/reservaDetalhe.ts`, `rotaeFrontend/src/modules/reserva/testes/unitarios/servicos.test.ts`

**Interfaces:**
- Produces: `type StatusPassagem = "CONFIRMADO" | "CANCELADO"`; `type Passagem` (campos das Global Constraints; `viagem` como `Pick<Reserva["viagem"], "origem" | "destino" | "partidaEm" | "chegadaEm">`, `passageiro: PassageiroReserva`); `type PassagemResumo = { id: number; viagemAssentoId: number; passageiroId: number; status: StatusPassagem }`; `ReservaDetalhe.passagens: PassagemResumo[]`; `buscarPassagem(passagemId: number): Promise<Passagem>`.

- [ ] **Step 1:** Testes `buscarPassagem traz a passagem da rota do backend` (200 → resolve corpo; chamado com `stringContaining("/api/v1/passagens/12/")`) e `buscarPassagem avisa quando o backend não devolve a passagem` (404 → rejeita `"Não foi possível carregar a passagem."`).
- [ ] **Step 2:** Rodar → FAIL (módulo inexistente).
- [ ] **Step 3:** Implementar no molde de `buscarReserva`.
- [ ] **Step 4:** Rodar → PASS; `npx tsc --noEmit` aponta fixtures/testes sem `passagens` — ajustar para `passagens: []` onde se monta `ReservaDetalhe`.
- [ ] **Step 5:** Commit `feat(reservas): tipo e serviço da passagem`.

### Task 3: BilhetePassagem e CarrosselPassagens

**Files:**
- Create: `rotaeFrontend/src/modules/reserva/components/BilhetePassagem.tsx`, `rotaeFrontend/src/modules/reserva/components/CarrosselPassagens.tsx`
- Create: `rotaeFrontend/src/modules/reserva/testes/fixtures/passagem.ts`, `rotaeFrontend/src/modules/reserva/testes/integracao/CarrosselPassagens.test.tsx`
- Modify: `rotaeFrontend/src/modules/reserva/pages/reservas.css` (só se o carrossel precisar de espaçamento)

**Interfaces:**
- Consumes: `Passagem`, `PassagemResumo`, `buscarPassagem` (Task 2); `Paginacao` com `rotulo` (Task 1); `useCarregarDados`, `AvisoDeErro`.
- Produces: `BilhetePassagem({ passagem }: { passagem: Passagem })`; `CarrosselPassagens({ passagens }: { passagens: PassagemResumo[] })`; fixture `criarPassagemFalsa(dados?: Partial<Passagem>): Passagem`.

- [ ] **Step 1:** Testes (mock de `buscarPassagem`):
  - `mostra a primeira passagem e navega para a próxima`: 2 resumos (ids 12, 13) → mostra "Mariana Oliveira", poltrona "45", `img` "QR Code da passagem #ROT-2026-0012", texto "Passagem 1 de 2"; clicar "Próxima" → "Pedro Souza", "46", "Passagem 2 de 2", "Próxima" desabilitado.
  - `não mostra classe nem valor no bilhete pago`: `queryByText("CLASSE")` e `queryByText(/VALOR/)` nulos.
  - `não deixa o bilhete anterior na tela enquanto a próxima passagem carrega`: segunda busca pendente → "Mariana Oliveira" some e aparece status de carregamento.
  - `mostra erro só da passagem que falhou`: rejeição → botão "Tentar novamente"; clique chama `buscarPassagem` de novo com o mesmo id.
  - `sem navegação com uma passagem só`: `queryByRole("navigation")` nulo.
  - `passagem cancelada não mostra QR de embarque`: `status: "CANCELADO"` → sem `img` QR, texto "Passagem cancelada".
  - `estado vazio`: `passagens=[]` → "Nenhuma passagem emitida para esta reserva."
- [ ] **Step 2:** `npx jest CarrosselPassagens` → FAIL.
- [ ] **Step 3:** `BilhetePassagem`: markup de `reserva-bilhete` atual (topo "BILHETE DIGITAL EMITIDO" + código; rota; divisor; dados PASSAGEIRO e POLTRONA; bloco de embarque com QR só se `CONFIRMADO`). `CarrosselPassagens`: estado `indice`; filho interno carregando `passagens[indice].id` com `key={id}`; `Paginacao` com `resumo`, `anterior/proxima` como índices em string e `rotulo="Passagens da reserva"`.
- [ ] **Step 4:** Rodar → PASS.
- [ ] **Step 5:** Commit `feat(reservas): carrossel de bilhetes por passagem`.

### Task 4: Bloco único da reserva não paga e troca na confirmação

**Files:**
- Modify: `rotaeFrontend/src/modules/reserva/components/BilheteReserva.tsx`, `rotaeFrontend/src/modules/reserva/components/ConfirmacaoReserva.tsx`, `rotaeFrontend/src/modules/reserva/utils/regrasReserva.ts` (remover `montarPassagens`)
- Test: `testes/unitarios/BilheteReserva.test.tsx`, `testes/unitarios/regrasReserva.test.ts`, `testes/integracao/EtapaConfirmacao.test.tsx`, `testes/integracao/ListaReservas.test.tsx`, `testes/e2e/reserva.e2e.ts`

**Interfaces:**
- Consumes: `CarrosselPassagens` (Task 3), `buscarPassagem` mockado nos testes de integração.
- Produces: `BilheteReserva({ reserva }: { reserva: ReservaDetalhe })` (sem `emitido`).

- [ ] **Step 1:** Reescrever testes:
  - `BilheteReserva`: `mostra um bloco único com todos os passageiros e poltronas` (1 `region` "Detalhes da reserva"; textos "Mariana Oliveira", "Pedro Souza", "45, 46"; sem QR). Remover testes de QR/pareamento e os de `montarPassagens`.
  - `EtapaConfirmacao` paga: reserva com `passagens: [{id:12,…},{id:13,…}]` e `buscarPassagem` mockado → heading "Reserva confirmada!", "Passagem 1 de 2", QR "#ROT-2026-0012"; links mantidos.
  - `ListaReservas` (modal "Ver 2 bilhetes"): mesmo ajuste, um QR visível por vez.
  - e2e: depois do pagamento, 1 QR visível, "Passagem 1 de 2", clicar "Próxima" mostra outro passageiro; idem no modal.
- [ ] **Step 2:** `npx jest src/modules/reserva` → FAIL.
- [ ] **Step 3:** `BilheteReserva` vira bloco único (`aria-label="Detalhes da reserva"`, topo "DETALHES DA RESERVA" + código da reserva, rota, PASSAGEIROS com `formatarNomesPassageiros` dos nomes ou "Não informados", POLTRONAS com `formatarPoltronas`). `ConfirmacaoReserva`: `emitido ? <CarrosselPassagens passagens={reserva.passagens} /> : <BilheteReserva reserva={reserva} />`. Apagar `montarPassagens`.
- [ ] **Step 4:** `npx jest` (tudo) e `npx tsc --noEmit` e `npm run lint` → verdes.
- [ ] **Step 5:** Commit `feat(reservas): bilhetes da reserva paga vêm das passagens`.

### Task 5: Verificação no navegador (worktree de testes)

- [ ] **Step 1:** `git worktree add C:/Projects/wt-passagem/teste feat/passagem-frontend` não é possível com a branch em uso → usar `--detach` no HEAD da branch.
- [ ] **Step 2:** Subir backend + frontend do worktree (docker compose dev ou `npm run dev` apontando para a API), com portas que não colidam com o checkout principal.
- [ ] **Step 3:** No navegador interno: login com usuário de seed → buscar viagem → 2 poltronas → passageiros → pagar (aprovado) → confirmação com "Passagem 1 de 2" → Próxima (bloqueio na última) → Minhas viagens → "Ver 2 bilhetes" → mesmo carrossel. Conferir cursor `not-allowed` na paginação da lista de viagens.
- [ ] **Step 4:** Anotar resultado; remover worktree só com o OK do Daniel.
