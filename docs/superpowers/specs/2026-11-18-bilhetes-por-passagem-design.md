# Bilhetes por passagem — design curto

**Data:** 2026-11-18 · **Branch:** `feat/passagem-frontend` · **Escopo:** só `rotaeFrontend` (backend intocado)

## Intenção

A reserva é uma só até o pagamento (mockado) ser aprovado. Depois disso, cada passageiro tem
seu próprio bilhete, montado **apenas** com o que o backend devolve em `/api/v1/passagens/<id>/`.
Hoje o frontend adivinha qual poltrona é de qual passageiro (`montarPassagens`), regra que o
backend não expõe: isso sai.

## Objetivos

- "Minhas viagens" continua com **um cartão por reserva** (não polui a lista e mantém o vínculo com a reserva).
- Reserva paga: os bilhetes viram um **carrossel paginado**, um bilhete por página (`Passagem 1 de N`),
  no modal "Ver bilhetes" e na tela de confirmação.
- Bilhete pago mostra só campos do endpoint: origem/destino com horários, passageiro, poltrona
  (`viagemAssento.numero`), código e QR Code. **Sem classe e sem valor** (aceito pelo Daniel).
- Reserva não paga (pendente, expirada, falha, cancelada): **um bloco único** "Detalhes da reserva",
  com a lista de passageiros e a lista de poltronas, sem parear um com o outro.
- Toda paginação usa o componente existente `shared/components/Paginacao.tsx`. Quando não há página
  para navegar, o botão desabilitado mostra o **ícone de bloqueio** (cursor `not-allowed`) e fica esmaecido.

## Não objetivos

- Não mexer no backend, nem em `ListaViagens` além do que vem de graça pela `Paginacao`.
- Não usar `/me/passagens/` (varreria todo o histórico para achar 2 ou 3 bilhetes).
- Não alterar `FormularioPassageiros`/`ordenarAssentos` (fora deste módulo de bilhete).

## Abordagens consideradas

1. **Escolhida:** o carrossel parte de `reserva.passagens` (ids vindos de `GET /reservas/<id>/`) e
   busca `GET /passagens/<id>/` só da página visível. Uma chamada por página; cada página é uma passagem real.
2. Buscar todas as `/passagens/<id>/` ao abrir: troca instantânea, mas N chamadas mesmo vendo só a primeira.
3. `/me/passagens/` filtrado por `reservaId`: descartada, cresce com o histórico.

## Desenho

- `types/passagem.ts`: `Passagem` = `{ id, reservaId, viagem: { origem, destino, partidaEm, chegadaEm },
  viagemAssento: { id, numero }, passageiro: PassageiroReserva, status: "CONFIRMADO" | "CANCELADO", criadoEm, atualizadoEm }`.
- `types/reservaDetalhe.ts`: ganha `passagens: { id, viagemAssentoId, passageiroId, status }[]`.
- `services/buscarPassagem.ts`: `GET /api/v1/passagens/<id>/` via `fetchAutenticado`.
- `components/BilhetePassagem.tsx`: o bilhete emitido (mesmo visual/CSS do bilhete atual, QR incluso).
  Código e QR = `formatarCodigoReserva({ id, criadoEm })` aplicado à **passagem**.
- `components/CarrosselPassagens.tsx`: guarda a página atual, carrega a passagem com `useCarregarDados`
  e navega com `<Paginacao resumo="Passagem i de N" … />`.
- `components/BilheteReserva.tsx`: vira o bloco único da reserva não paga; sai `montarPassagens` e o QR.
- `components/ConfirmacaoReserva.tsx`: `emitido ? <CarrosselPassagens …/> : <BilheteReserva …/>`.
- `shared/components/Paginacao.tsx` + `Paginacao.module.css`: botão desabilitado com `cursor: not-allowed`
  e opacidade reduzida; `aria-label` configurável (o carrossel não é "resultados").

## Decisões minhas (para revisar)

- Ícone de bloqueio = cursor `not-allowed` do navegador no botão desabilitado (sem ícone novo no botão).
- Reserva paga sem passagens: mostra "Nenhuma passagem emitida para esta reserva." (estado vazio, sem regra nova).
- Com uma passagem só, a `Paginacao` continua oculta (comportamento atual do componente).

## Verificação

- Testes Jest do módulo atualizados (bilhete, confirmação, carrossel, serviço, paginação).
- Fluxo completo no navegador interno, rodando a partir de um worktree separado de testes:
  reservar 2+ poltronas → passageiros → pagar → confirmação com carrossel → Minhas viagens → Ver bilhetes.
