# Guia de contribuição — Frontend

Este documento define a estrutura do frontend do Rotaê e o fluxo para implementação de novas telas e
integrações com a API.

---

## Sumário

- [Arquitetura](#arquitetura)
- [Fluxo de implementação](#fluxo-de-implementação)
  - [1. Tipo](#1-tipo)
  - [2. Serviço](#2-serviço)
  - [3. Hook](#3-hook)
  - [4. Componente](#4-componente)
  - [5. Página do módulo](#5-página-do-módulo)
  - [6. Rota](#6-rota)
  - [7. Estilos](#7-estilos)
  - [8. Resultado](#8-resultado)
  - [9. Quando dividir os arquivos](#9-quando-dividir-os-arquivos)
  - [10. Testes](#10-testes)
  - [11. Lint e build](#11-lint-e-build)
- [Referência rápida](#referência-rápida)

---

## Arquitetura

O frontend é uma aplicação Next.js (App Router) dividida em módulos de acordo com os assuntos do
produto, no mesmo espírito dos Apps do backend:

```text
rotaeFrontend/src/
├── app/        rotas do App Router
├── lib/        api.ts: montagem de URL e leitura de páginas do DRF
├── modules/
│   ├── autenticacao/
│   ├── cidade/
│   ├── passagem/
│   ├── reserva/
│   ├── usuario/
│   ├── viagem/
│   └── viagem-assento/
└── shared/     o que não pertence a um assunto só
```

* `autenticacao`: sessão, login e `fetchAutenticado`
* `usuario`: cadastro, perfil, senha e exclusão de conta
* `cidade`: lista de cidades (com cache)
* `viagem`: busca, filtros e listagem de viagens
* `viagem-assento`: mapa de poltronas
* `reserva`: checkout (assentos, passageiros, pagamento) e "Minhas viagens"
* `passagem`: bilhete de cada passageiro depois do pagamento
* `shared`: componentes, hooks, tipos e utilitários usados por mais de um módulo

O módulo é a principal unidade de organização. Não criamos necessariamente um módulo para cada
entidade da API: um módulo novo aparece quando há um assunto com telas ou regras próprias.

O frontend não tem banco nem regra de negócio própria: tudo que ele mostra vem da API. As regras
definitivas (validação de CPF, prazo da reserva, emissão de passagens) são do backend; o frontend só
faz checagens rápidas antes de enviar e mostra o que a API devolve.

A estrutura de um módulo é:

```text
passagem/
├── types/
├── services/
├── hooks/
├── components/
├── pages/
├── utils/
├── classes/
└── testes/
```

### Responsabilidades

| Pasta         | Responsabilidade                                         |
| ------------- | -------------------------------------------------------- |
| `types/`      | contratos TypeScript, **um por arquivo**                 |
| `services/`   | chamadas à API, **uma por arquivo** (por caso de uso)    |
| `hooks/`      | estado de tela e efeitos (`"use client"`)                |
| `components/` | pedaços de tela                                          |
| `pages/`      | a tela inteira que a rota usa, com o CSS da tela         |
| `utils/`      | funções puras de formato e regra de exibição             |
| `classes/`    | regras e erros em classes (validação, ordenação, erros)  |
| `testes/`     | testes automatizados do módulo                           |

Não é necessário usar todas as pastas em toda funcionalidade. O módulo `passagem`, por exemplo, só tem
`types/`, `services/`, `components/` e `testes/`. Um componente simples não deve ganhar um hook apenas
por formalidade.

A regra de um arquivo por responsabilidade está em
[rotaeFrontend/AGENTS.md](../rotaeFrontend/AGENTS.md).

---

# Fluxo de implementação

Para uma nova tela ou integração com uma rota da API, siga esta ordem:

```text
Tipo
  ↓
Serviço
  ↓
Hook (quando necessário)
  ↓
Componente
  ↓
Página do módulo
  ↓
Rota (src/app)
  ↓
Testes
```

Os exemplos abaixo vêm do módulo `passagem`, que mostra o bilhete de cada passageiro de uma reserva
paga.

---

## 1. Tipo

Comece pelo contrato da API. O tipo espelha o JSON que o backend devolve (camelCase, como o DRF do
projeto responde), um contrato por arquivo.

`passagem/types/statusPassagem.ts`:

```ts
export type StatusPassagem = "CONFIRMADO" | "CANCELADO";
```

`passagem/types/passagemResumo.ts`:

```ts
import type { StatusPassagem } from "./statusPassagem";

// Versão enxuta que a reserva traz para cada passagem.
export type PassagemResumo = {
  id: number;
  viagemAssentoId: number;
  passageiroId: number;
  status: StatusPassagem;
};
```

Reutilize o mesmo tipo quando entidade e payload têm o mesmo contrato. Crie tipos separados só quando o
formato for realmente diferente (como `Passagem` e `PassagemResumo`).

Consulte o [MODELO_DE_DADOS.md](MODELO_DE_DADOS.md) para as entidades e o Swagger do backend
(`/docs/`) para o formato de cada rota.

---

## 2. Serviço

O serviço é só a chamada à API e a tradução da resposta. Nada de estado, nada de JSX.

`passagem/services/buscarPassagem.ts`:

```ts
import { apiUrl } from "@/lib/api";
import { fetchAutenticado } from "@/modules/autenticacao/services/fetchAutenticado";
import type { Passagem } from "../types/passagem";

export async function buscarPassagem(passagemId: number): Promise<Passagem> {
  const resposta = await fetchAutenticado(apiUrl(`/api/v1/passagens/${passagemId}/`));

  if (!resposta.ok) throw new Error("Não foi possível carregar a passagem.");
  return await resposta.json() as Passagem;
}
```

* Todo endereço passa por `apiUrl`, de [src/lib/api.ts](../rotaeFrontend/src/lib/api.ts). No servidor
  ela devolve a URL absoluta (com `API_URL`); no navegador, o caminho relativo que o rewrite do
  `next.config.ts` repassa para a API.
* Rotas que exigem login usam `fetchAutenticado` em vez de `fetch`: ele envia o token e renova a
  sessão quando a API responde 401.
* Listas paginadas do DRF usam `buscarPagina<T>` (uma página) ou `listarResultadosPaginados<T>`
  (todas as páginas), também de `lib/api.ts`.
* Erro esperado volta como valor (por exemplo, `criarReserva` devolve a reserva ou os assentos
  ocupados); erro inesperado vira `throw`. Quem decide o que mostrar é o hook ou o componente.

---

## 3. Hook

Hooks guardam estado de tela. Para buscar algo quando a tela abre, use o `useCarregarDados` antes de
escrever um hook novo:

```tsx
const { dados, erro, carregando, recarregar } = useCarregarDados(
  buscarPassagem,
  passagemId,
  "Não foi possível carregar a passagem.",
);
```

Ele ignora a resposta de uma busca antiga e mantém os dados anteriores enquanto recarrega. O serviço
passado precisa ser uma função fixa (um serviço importado), não uma função criada dentro do componente.

Crie um hook próprio quando a tela tiver regra de estado que não cabe no componente: o mapa de assentos
que consulta a API a cada 5 s (`useMapaAssentos`), o envio único do pagamento (`usePagamento`), os
filtros com atraso antes de consultar (`useFiltrosViagem`).

Não criar hooks apenas para mover duas linhas de `useState` para outro arquivo.

---

## 4. Componente

O componente monta a tela com o que o serviço e o hook entregam.

`passagem/components/CarrosselPassagens.tsx` (resumido):

```tsx
"use client";

// Carrega o bilhete de uma passagem. Quem usa troca o `key` a cada passagem para começar do zero.
function BilheteCarregado({ passagemId }: { passagemId: number }) {
  const { dados, erro, recarregar } = useCarregarDados(buscarPassagem, passagemId, MENSAGEM_DE_ERRO);

  if (erro) return <AvisoDeErro mensagem={erro} aoTentarNovamente={recarregar} />;
  if (!dados) return <BilhetePassagemSkeleton />;
  return <BilhetePassagem passagem={dados} />;
}
```

* Reutilize antes de criar: `shared/components` já tem `Button`, `CampoFormulario`, `Container`,
  `Paginacao`, `Skeleton` e `EtapasCheckout`.
* **Toda paginação usa `Paginacao`.** Sem página para ir, o botão fica bloqueado. Se precisar de outro
  visual, passe `className`; não crie outro componente de paginação.
* Enquanto carrega, prefira um skeleton com a mesma marcação do conteúdo, para a tela não mudar de
  tamanho.
* Mostre só o que a API devolve. Se a rota não traz um dado, não o invente nem o calcule a partir de
  outro.
* Componentes com estado ou eventos levam `"use client"`; serviços e tipos não.
* O projeto usa o React Compiler (`reactCompiler: true`), então não espalhe `useMemo`/`useCallback`.

---

## 5. Página do módulo

A página do módulo é a tela inteira: junta os componentes, decide o que mostrar para quem não está
logado e importa o CSS da tela.

`reserva/pages/ConfirmacaoReservaPage.tsx`:

```tsx
"use client";

import "@/modules/viagem/pages/viagens.css";
import "./reservas.css";

export function ConfirmacaoReservaPage({ reservaId }: { reservaId: number }) {
  const { estado } = useAutenticacao();

  return (
    <main className="viagem-page reserva-page">
      <Container className="reserva-confirmacao-pagina">
        {estado === "autenticado" && <EtapaConfirmacao key={reservaId} reservaId={reservaId} />}
        {estado === "anonimo" && /* convite para entrar */ null}
      </Container>
    </main>
  );
}
```

Páginas que só repassam props podem ficar no servidor (`ConsultaViagensPage`); as que leem a sessão são
de cliente.

---

## 6. Rota

As rotas ficam em `src/app/` e só encaminham para a página do módulo. Telas com cabeçalho e rodapé
ficam em `(app)/`; login e cadastro, em `(auth)/`.

`src/app/(app)/reservas/[id]/confirmacao/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { ConfirmacaoReservaPage } from "@/modules/reserva/pages/ConfirmacaoReservaPage";

export default async function ConfirmacaoPage({ params }: PageProps<"/reservas/[id]/confirmacao">) {
  const { id } = await params;
  const reservaId = Number(id);

  if (!Number.isSafeInteger(reservaId) || reservaId < 1) notFound();

  return <ConfirmacaoReservaPage reservaId={reservaId} />;
}
```

* Rotas com `[id]` rejeitam id inválido com `notFound()` antes de chamar a API.
* A versão do Next.js do projeto tem mudanças em relação às versões anteriores. Antes de usar uma API
  do Next que você não conhece, leia o guia em `rotaeFrontend/node_modules/next/dist/docs/`.

A tela resultante será:

```text
/reservas/{id}/confirmacao
```

---

## 7. Estilos

Cada tipo de estilo tem seu lugar:

* **Tokens** (cores, raios, sombras, larguras) em `src/app/globals.css`. Use sempre as variáveis:
  `var(--color-brand-950)`, `bg-(--color-surface-card)`.
* **CSS da tela**, importado pela página do módulo: `viagem/pages/viagens.css`,
  `viagem-assento/pages/assentos.css`, `reserva/pages/reservas.css`. As classes levam o prefixo do
  módulo (`reserva-bilhete`, `viagem-card`).
* **CSS Modules** em `src/shared/styles/`, para componentes compartilhados com estilo próprio
  (`Paginacao.module.css`, `Skeleton.module.css`).
* **Tailwind** no JSX, nas telas de conta e nos componentes de `shared`, sempre com os tokens.

O visual segue o Figma do projeto. Animações respeitam `prefers-reduced-motion`.

---

## 8. Resultado

O bilhete por passageiro ficou organizado assim:

```text
passagem/
├── types/
│   ├── passagem.ts
│   ├── passagemResumo.ts
│   └── statusPassagem.ts
├── services/
│   └── buscarPassagem.ts
├── components/
│   ├── BilhetePassagem.tsx
│   ├── BilhetePassagemSkeleton.tsx
│   └── CarrosselPassagens.tsx
└── testes/
    ├── fixtures/passagem.ts
    ├── unitarios/buscarPassagem.test.ts
    └── integracao/CarrosselPassagens.test.tsx
```

Fluxo completo:

```text
/reservas/{id}/confirmacao
        ↓
src/app/(app)/reservas/[id]/confirmacao/page.tsx
        ↓
ConfirmacaoReservaPage
        ↓
ConfirmacaoReserva ── buscarReserva → GET /api/v1/reservas/{id}/  (traz os resumos das passagens)
        ↓
CarrosselPassagens
        ↓
useCarregarDados(buscarPassagem) → GET /api/v1/passagens/{id}/
        ↓
BilhetePassagem
```

---

## 9. Quando dividir os arquivos

A estrutura inicial deve permanecer simples.

Se um componente crescer muito (>150 linhas) ou misturar responsabilidades, separe:

* a busca e o estado vão para um hook em `hooks/`;
* pedaços da tela vão para componentes próprios em `components/`;
* regras puras (formatação, decisão de status) vão para `utils/`.

Quando algo passa a ser usado por mais de um módulo, mova para `shared/`. Enquanto só um módulo usa,
deixe no módulo.

Não criar uma pasta ou um módulo novo apenas para aumentar a organização. A divisão deve acontecer
quando a quantidade de código ou a complexidade justificar.

---

## 10. Testes

Os testes são escritos com **Jest** e **Testing Library** e ficam dentro de cada módulo, divididos
entre unitários e de integração:

```text
passagem/
└── testes/
    ├── fixtures/
    │   └── passagem.ts
    ├── unitarios/
    │   └── buscarPassagem.test.ts
    └── integracao/
        └── CarrosselPassagens.test.tsx
```

* **`unitarios/`**: serviços, utils e classes isolados. O `fetch` (ou `fetchAutenticado`) é
  substituído por um mock.
* **`integracao/`**: componentes renderizados com `render`, com os serviços mockados, testando o que a
  pessoa vê e faz na tela (textos, botões, navegação).
* **`e2e/`**: testes de ponta a ponta com **Playwright** (`*.e2e.ts`), contra frontend e backend de
  verdade. A extensão diferente impede o Jest de executá-los.
* **`fixtures/`**: funções que criam dados falsos (`criarPassagemFalsa`, `criarReservaFalsa`).

Exemplo de teste de integração:

```tsx
jest.mock("../../services/buscarPassagem");

it("mostra a primeira passagem e navega para a próxima", async () => {
  render(<CarrosselPassagens passagens={resumos} />);

  expect(await screen.findByText("Mariana Oliveira")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Próxima" }));
  expect(await screen.findByText("Pedro Souza")).toBeInTheDocument();
});
```

Prefira buscar elementos pelo papel e pelo nome acessível (`getByRole("button", { name: "Próxima" })`)
em vez de classes CSS.

### Como rodar

```bash
docker compose -f docker-compose.dev.yml exec frontend npm test               # roda tudo
docker compose -f docker-compose.dev.yml exec frontend npm test -- passagem   # só um módulo
docker compose -f docker-compose.dev.yml exec frontend npm run test:watch     # modo watch
```

Fora do Docker, dentro de `rotaeFrontend/`, os mesmos comandos funcionam sem o prefixo
(`npm test`).

### Testes de ponta a ponta

```bash
cd rotaeFrontend
npm run test:e2e
```

Precisam do backend rodando e de duas contas já criadas, definidas no `rotaeFrontend/.env`
(`E2E_API_URL`, `E2E_EMAIL_A`, `E2E_SENHA_A`, `E2E_EMAIL_B`, `E2E_SENHA_B`). Sem elas, o teste se
ignora sozinho. Os testes E2E não fazem parte do CI.

---

## 11. Lint e build

Utilizamos o **ESLint** com a configuração do Next.js (`core-web-vitals` + `typescript`) e o
TypeScript em modo `strict`.

### Como rodar via Docker

Antes de realizar commits ou abrir um Pull Request, execute:

```bash
docker compose -f docker-compose.dev.yml exec frontend npm run lint
docker compose -f docker-compose.dev.yml exec frontend npx tsc --noEmit
docker compose -f docker-compose.dev.yml exec frontend npm test
docker compose -f docker-compose.dev.yml exec frontend npm run build
```

O CI roda `npm run lint`, `npm test` e `npm run build` no frontend.

### Configuração no VS Code (Recomendado)

Instale a extensão oficial **ESLint** (`dbaeumer.vscode-eslint`) e adicione ao seu
`.vscode/settings.json`:

```json
{
  "[typescript][typescriptreact]": {
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit"
    }
  }
}
```

---

## Referência rápida

### Onde colocar cada coisa?

**Contrato da API** -> `types/` (um por arquivo)

**Chamada à API** -> `services/` (uma por arquivo)

**Estado de tela** -> `hooks/`

**Pedaço de tela** -> `components/`

**Tela inteira** -> `pages/`

**Rota** -> `src/app/` (só encaminha para a página do módulo)

**Regra pura de exibição** -> `utils/`

**Usado por mais de um módulo** -> `shared/`

**Testes** -> `testes/`

**Tokens visuais** -> `src/app/globals.css`

### Regra geral

> Mostre o que a API devolve, reutilize o que já existe em `shared/` e evite criar camadas ou
> abstrações que não sejam necessárias para a funcionalidade.
