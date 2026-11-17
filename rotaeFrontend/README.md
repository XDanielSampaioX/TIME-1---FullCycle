# Rotaê — Frontend

Interface web do Rotaê, um site de passagens de ônibus: buscar viagens, escolher a poltrona,
informar os passageiros e acompanhar as reservas.

É uma das três aplicações do repositório `TIME-1---FullCycle`, ao lado de `rotaeBackend`
(API Django) e `rotaeNginx`. Este frontend não tem banco nem regra de negócio própria:
tudo que ele mostra vem da API.

## Stack

| O quê | Versão | Onde aparece |
| --- | --- | --- |
| Next.js (App Router) | 16.3.5 | `src/app/` |
| React | 19.2.8 | componentes de `src/modules/` e `src/shared/` |
| TypeScript (`strict`) | 5.x | todo o `src/` |
| Tailwind CSS | 4.x | via `@tailwindcss/postcss`, importado em `src/app/globals.css` |
| Jest + Testing Library | 30.x | `src/modules/**/testes/` |
| Playwright | 1.64.1 | `src/modules/**/testes/e2e/` |
| qrcode.react | 4.2.0 | QR Code do bilhete |

O React Compiler está ligado em `next.config.ts` (`reactCompiler: true`), por isso não há
`useMemo`/`useCallback` espalhados pelos componentes.

## Como rodar

Node 20 (é a versão usada nos Dockerfiles).

```bash
npm install
```

Crie o `.env` a partir do exemplo e aponte para a API:

```bash
cp .env.example .env
```

```ini
# .env
API_URL=http://localhost:8000
```

```bash
npm run dev
```

A aplicação sobe em http://localhost:3000.

### Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção |
| `npm start` | serve o build |
| `npm run lint` | ESLint (`eslint-config-next`: core-web-vitals + typescript) |
| `npm test` | testes com Jest |
| `npm run test:watch` | Jest em modo watch |
| `npm run test:e2e` | testes de ponta a ponta com Playwright |

### Com Docker

O `docker-compose.yml` na raiz do repositório sobe backend, frontend e nginx juntos. O serviço
`frontend` usa o `Dockerfile.dev`, monta a pasta como volume e lê o `./rotaeFrontend/.env`
(nesse cenário o valor de `API_URL` é `http://backend:8000`, como no `.env.example`).

```bash
docker compose up --build
```

## Como o frontend conversa com o backend

Todo acesso à API passa por `apiUrl`, em [src/lib/api.ts](src/lib/api.ts). Ela devolve
endereços diferentes conforme onde o código roda:

```ts
// no servidor (componente async, build): URL absoluta com API_URL
apiUrl("/api/v1/viagens/"); // "http://localhost:8000/api/v1/viagens/"

// no navegador: caminho relativo
apiUrl("/api/v1/viagens/"); // "/api/v1/viagens/"
```

No navegador o caminho relativo cai no rewrite declarado em `next.config.ts`, que repassa
para a API:

```ts
async rewrites() {
  return [{ source: "/api/:path*/", destination: `${API_URL}/api/:path*/` }];
}
```

`src/lib/api.ts` também traz os dois jeitos de ler listas paginadas do DRF:

- `buscarPagina<T>(caminho, mensagemErro)` — uma página (`{ count, next, previous, results }`);
- `listarResultadosPaginados<T>(caminho, mensagemErro)` — segue `next` até o fim e devolve um array.

Requisições que precisam de login usam `fetchAutenticado` (ver o módulo
[autenticacao](#autenticacao)) em vez do `fetch` direto.

## Estrutura de pastas

```
src/
├── app/            rotas do App Router (cada page.tsx só delega para um módulo)
├── lib/            api.ts: montagem de URL e leitura de páginas do DRF
├── modules/        um módulo por assunto do produto
│   ├── autenticacao/
│   ├── cidade/
│   ├── reserva/
│   ├── usuario/
│   ├── viagem/
│   └── viagem-assento/
└── shared/         o que não pertence a um assunto só
    ├── components/ Button, Container, Header, Footer, Paginacao, Skeleton, EtapasCheckout…
    ├── hooks/      useClienteMontado, useFecharMenuSuspenso
    ├── styles/     CSS Modules (EtapasCheckout, Paginacao, Skeleton)
    ├── types/      pagina.ts (Pagina<T>, PaginacaoProps)
    └── utils/      formatarDataHora, formatarValorEmReais
```

`public/` tem as imagens da home e os SVGs usados nas telas de viagem e do bilhete.

## Anatomia de um módulo

Todos os módulos seguem as mesmas pastas, e só criam as que precisam:

| Pasta | Responsabilidade | Exemplo |
| --- | --- | --- |
| `types/` | um contrato por arquivo | `reserva/types/statusReserva.ts` |
| `services/` | uma chamada à API por arquivo | `reserva/services/criarReserva.ts` |
| `hooks/` | estado de tela | `reserva/hooks/useCarregarDados.ts` |
| `components/` | pedaços de tela | `reserva/components/CardReserva.tsx` |
| `pages/` | a tela inteira que a rota usa | `reserva/pages/MinhasViagensPage.tsx` |
| `classes/` | regras em classes | `usuario/classes/validacao/RegraFormatoCampo.ts` |
| `utils/` | funções puras de formato e regra | `reserva/utils/regrasReserva.ts` |
| `testes/` | testes do módulo | `reserva/testes/unitarios/` |

A regra de um arquivo por responsabilidade está em [AGENTS.md](AGENTS.md).

Um serviço é só a chamada e a tradução da resposta — nada de estado:

```ts
// src/modules/viagem/services/buscarViagem.ts
export async function buscarViagem(viagemId: number): Promise<Viagem | null> {
  const resposta = await fetch(apiUrl(`/api/v1/viagens/${viagemId}/`));

  if (resposta.status === 404) return null;
  if (!resposta.ok) throw new Error("Não foi possível carregar os dados da viagem.");

  return resposta.json() as Promise<Viagem>;
}
```

E a rota só encaminha para a tela do módulo:

```tsx
// src/app/minhas-viagens/page.tsx
import { MinhasViagensPage } from "@/modules/reserva/pages/MinhasViagensPage";

export default function Page() {
  return <MinhasViagensPage />;
}
```

O apelido `@/` aponta para `src/` (configurado em `tsconfig.json` e repetido no
`moduleNameMapper` do Jest).

## Rotas

| URL | Arquivo | Tela do módulo |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | seções de `shared/components` (Hero, Destinos, Como funciona, Segurança) |
| `/login` | `src/app/login/page.tsx` | `autenticacao/pages/LoginPage` |
| `/cadastro` | `src/app/cadastro/page.tsx` | `usuario/pages/CadastroUsuarioPage` |
| `/editar-perfil` | `src/app/editar-perfil/page.tsx` | `usuario/pages/EdicaoPerfilPage` |
| `/viagens` | `src/app/viagens/page.tsx` | `viagem/pages/ConsultaViagensPage` |
| `/viagens/[id]/assentos` | `src/app/viagens/[id]/assentos/page.tsx` | `reserva/pages/SelecaoAssentosPage` |
| `/reservas/[id]/passageiros` | `src/app/reservas/[id]/passageiros/page.tsx` | `reserva/pages/DadosPassageirosPage` |
| `/reservas/[id]/confirmacao` | `src/app/reservas/[id]/confirmacao/page.tsx` | `reserva/pages/ConfirmacaoReservaPage` |
| `/minhas-viagens` | `src/app/minhas-viagens/page.tsx` | `reserva/pages/MinhasViagensPage` |

As rotas com `[id]` rejeitam id inválido com `notFound()`:

```tsx
// src/app/reservas/[id]/passageiros/page.tsx
const reservaId = Number(id);
if (!Number.isSafeInteger(reservaId) || reservaId < 1) notFound();
```

`src/app/layout.tsx` envolve todas as páginas com o `AutenticacaoProvider`, o `Header` e o `Footer`.

## Os módulos, um por um

### autenticacao

Sessão do usuário. A sessão (`access`, `refresh` e `user`) fica no `localStorage` na chave
`rotae.sessao`, por `utils/sessaoSalva.ts`. O `AutenticacaoContext` lê essa chave com
`useSyncExternalStore`, então todas as abas acompanham o mesmo estado, e ao abrir a página
confirma a sessão em `GET /api/v1/me/`. Se o servidor não responder, a sessão é mantida e o
contexto expõe `sessaoIndisponivel` (o `MenuUsuario` mostra o aviso).

`estado` tem três valores: `"carregando"` (ainda lendo o `localStorage`), `"anonimo"` e
`"autenticado"`.

`services/fetchAutenticado.ts` é um Proxy com o mesmo contrato do `fetch`: envia o token e, se
a resposta for 401, renova os tokens e repete a requisição uma vez. Requisições simultâneas
compartilham a mesma renovação, porque o refresh token só vale uma vez.

```ts
const resposta = await fetchAutenticado(apiUrl("/api/v1/me/reservas/"));
```

| Serviço | Chamada |
| --- | --- |
| `entrar` | `POST /api/v1/auth/login/` |
| `renovarTokens` | `POST /api/v1/auth/refresh/` |
| `buscarUsuarioAutenticado` | `GET /api/v1/me/` |

### usuario

Cadastro, edição de perfil, troca de senha e exclusão de conta. Também é dono dos componentes
de formulário reaproveitados em outras telas (`CampoFormulario`, `MenuUsuario`,
`AvatarUsuario`) e do hook `useFocoPrimeiroErro`, que leva o foco ao primeiro campo inválido.

As validações de tela vivem em `classes/validacao/` no padrão Composite: uma regra e um grupo
de regras se validam do mesmo jeito, então um grupo pode conter outros grupos.

```ts
// src/modules/usuario/classes/validacao/regrasAlteracaoSenha.ts
const regrasNovaSenha = new GrupoRegrasValidacao<AlteracaoSenha>([
  new RegraCampoObrigatorio("novaSenha", "Informe a nova senha."),
  new RegraTamanhoMinimo("novaSenha", 8, "A senha deve ter pelo menos 8 caracteres."),
  new RegraCamposIguais("confirmacaoNovaSenha", "novaSenha", "A confirmação não confere com a nova senha."),
]);

regrasAlteracaoSenha.validar(dados); // { novaSenha: "Informe a nova senha." } ou {}
```

São checagens rápidas antes do envio; as regras definitivas (dígitos do CPF, força da senha,
e-mail já cadastrado) são do backend, e `services/lerErrosPorCampo.ts` transforma a resposta
400 em uma mensagem por campo.

O cadastro tem um conjunto próprio de classes em `classes/` (`RegraCadastro` e companhia),
anterior às de `classes/validacao/`, que são genéricas.

| Serviço | Chamada |
| --- | --- |
| `cadastrarUsuario` | `POST /api/v1/usuarios/` |
| `atualizarUsuario` | `PATCH /api/v1/me/` |
| `alterarSenha` | `POST /api/v1/me/senha/` |
| `excluirConta` | `DELETE /api/v1/me/` |

### viagem

Busca e listagem de viagens. `obterBuscaViagem` lê a query string (`origem`, `destino`,
`partida`, `passageiros`) e devolve um `BuscaViagem`; `consultarViagensDisponiveis` descarta
viagens que não servem (status diferente de `AGENDADA`, partida no passado, assentos livres
abaixo do pedido).

O `ViagemContext` guarda a página atual de viagens e a lista de cidades. `useFiltrosViagem`
monta a query da API a partir dos filtros da tela (período, classe, faixa de preço, ordenação)
com um atraso de 250 ms antes de consultar.

As ordenações são classes que carregam o rótulo e o parâmetro da API:

```ts
// src/modules/viagem/classes/OrdenacaoMenorPreco.ts
export class OrdenacaoMenorPreco extends OrdenacaoViagem {
  readonly id = "preco";
  readonly titulo = "Menor preço";
  readonly parametroApi = "preco";
}
```

| Serviço | Chamada |
| --- | --- |
| `listarViagens` | `GET /api/v1/viagens/` (uma página) |
| `buscarViagem` | `GET /api/v1/viagens/{id}/` |

### viagem-assento

O mapa de poltronas. Um `ViagemAssento` tem `id` (a poltrona nesta viagem), `assentoId` (a
poltrona no ônibus) e `status` (`DISPONIVEL`, `SEGURADO` ou `RESERVADO`).

Os componentes `MapaAssentos` e `ResumoSelecaoAssentos` são usados pela tela de assentos do
módulo `reserva`, e `listarViagensAssentos` chama `GET /api/v1/viagens/{id}/assentos/`.

### cidade

Lista de cidades para os campos de origem e destino. `listarCidades` é um Proxy que mantém as
cidades em cache por 5 minutos, compartilha uma requisição em andamento entre chamadas
simultâneas e aceita `listarCidades(true)` para ignorar o cache. Lê todas as páginas de
`GET /api/v1/cidades/`.

### reserva

O checkout e a tela "Minhas viagens". É o maior módulo.

| Serviço | Chamada |
| --- | --- |
| `criarReserva` | `POST /api/v1/reservas/` |
| `buscarReserva` | `GET /api/v1/reservas/{id}/` (traz os passageiros) |
| `cadastrarPassageiros` | `POST /api/v1/reservas/{id}/passageiros/` |
| `cancelarReserva` | `POST /api/v1/reservas/{id}/cancelar/` |
| `listarMinhasReservas` | `GET /api/v1/me/reservas/` (todas as páginas) |

O caminho da compra, do jeito que está no código:

1. **Assentos** (`/viagens/[id]/assentos`) — `SelecaoAssentos` busca a viagem e confere se ela
   tem lugar para a quantidade de passageiros antes de abrir o mapa. `useMapaAssentos` consulta
   os assentos a cada 5 s, fica parado quando a aba está oculta e mantém o último mapa na tela
   se uma consulta falhar.
2. **Segurar a poltrona** — o backend só segura assento criando reserva, e a reserva não aceita
   trocar assentos. Por isso cada clique em uma poltrona cancela a reserva anterior e cria
   outra (`useSelecaoAssentos`). Sair da tela sem continuar devolve as poltronas (evento
   `pagehide` + `cancelarReserva` com `keepalive`). Se outra pessoa pegar a poltrona primeiro, o
   backend responde 409 com a lista de ocupadas e o hook tenta de novo sem elas.
3. **Passageiros** (`/reservas/[id]/passageiros`) — `EtapaPassageiros` só abre o formulário se
   a reserva ainda aceita passageiros: pagamento pendente, dentro do prazo e sem passageiros
   cadastrados. `useDadosPassageiros` cria um formulário por poltrona (`totalAssentos`), valida
   com `regrasPassageiro`, marca CPF repetido entre os passageiros e tem um atalho para copiar
   os dados da conta.
4. **Confirmação** (`/reservas/[id]/confirmacao`) — `ConfirmacaoReserva` mostra o bilhete, com
   QR Code quando ele conta como emitido. O mesmo componente é reaproveitado dentro do modal
   de "Minhas viagens" (`dentroDoModal`).

Em "Minhas viagens", `separarReservas` divide a lista em **Próximas** (pendentes ou pagas com
viagem futura) e **Histórico** (as demais dos últimos 90 dias), com 5 reservas por página.
`/me/reservas/` não traz os passageiros, então os nomes de cada cartão vêm do detalhe das
reservas visíveis.

As etapas do checkout aparecem na barra de `shared/components/EtapasCheckout.tsx`
("Seleção de assentos", "Dados dos passageiros", "Pagamento", "Confirmação"): assentos usa
`atual={1}`, passageiros `atual={2}` e a tela de confirmação não mostra a barra.

### shared

O que não é de um assunto só: `Button`, `Container`, `Header`, `Footer`, `Paginacao`,
`Skeleton`, `EtapasCheckout` e as seções da home. `useClienteMontado` devolve `false` no
servidor e na primeira renderização do navegador, o que evita mostrar "faça login" por um
instante a quem já está logado. `useFecharMenuSuspenso` fecha um `<details>` com Esc, clique
fora ou Tab para fora.

`PopularDestinations` é um componente async que roda no servidor: lê as viagens, pega o menor
preço por destino e mostra quatro. Se a API falhar, a seção fica vazia.

## Padrões que se repetem no código

- **Serviço por caso de uso** — um arquivo, uma chamada à API. Quem decide o que fazer com erro
  é o hook ou o componente.
- **Erro esperado volta como valor; erro inesperado vira exceção.** `entrar` devolve
  `{ sessao }` ou `{ erro }`; `criarReserva` devolve a reserva ou a lista de assentos ocupados;
  já um 500 virá como `throw`.
- **`useCarregarDados`** (em `reserva/hooks/`) é o jeito padrão de buscar algo ao abrir a tela:
  devolve `{ dados, erro, carregando, recarregar }`, ignora a resposta de uma busca antiga e
  mantém os dados anteriores enquanto recarrega.

  ```tsx
  const { dados, erro, carregando, recarregar } = useCarregarDados(
    buscarReserva,
    reservaId,
    "Não foi possível carregar os detalhes da reserva.",
  );
  ```

- **Proxy** em dois lugares: `fetchAutenticado` (token e renovação) e `listarCidades` (cache).
- **Composite** nas validações de formulário (`RegraValidacao` / `GrupoRegrasValidacao`).
- **Classes para variações de UI**: as ordenações de viagem e as ações do `Header`.
- **Hooks são `"use client"`; serviços e tipos não.** Páginas que só repassam props ficam no
  servidor (`ConsultaViagensPage`), e as que leem a sessão são de cliente.

## Estilos

Três coisas convivendo, cada uma com seu lugar:

- **Tokens e base** em `src/app/globals.css`: variáveis de cor, raio, sombra e largura em
  `:root`, mais `@theme inline` para o Tailwind. É o arquivo a mudar para ajustar a identidade
  visual.
- **CSS por tela**, importado pela página do módulo: `viagem/pages/viagens.css`,
  `viagem-assento/pages/assentos.css` e `reserva/pages/reservas.css`. As telas de reserva
  reaproveitam as classes de viagem (`.viagem-page`, `.viagem-selecionar`) e `reservas.css`
  acrescenta só o que falta.
- **Classes utilitárias do Tailwind** no JSX, nas telas de conta e nos componentes de `shared`,
  sempre com os tokens: `bg-(--color-surface-card)`, `rounded-(--radius-lg)`.
- **CSS Modules** em `src/shared/styles/`, para os três componentes compartilhados que têm
  estilo próprio.

## Testes

Os testes ficam dentro do módulo que eles testam, em `testes/`. O módulo `reserva` separa por
tipo (`unitarios/`, `integracao/`, `e2e/`); os outros deixam os arquivos direto em `testes/`,
com as fixtures em `testes/fixtures/`.

```bash
npm test
```

```bash
npm test -- reserva
```

Jest usa `next/jest`, ambiente `jsdom` e `@testing-library/jest-dom` (carregado em
`jest.setup.ts`). `coverageProvider` é `v8`; os relatórios saem em `coverage/`.

Os testes de ponta a ponta usam Playwright, rodam contra frontend e backend de verdade e ficam
em `src/modules/<modulo>/testes/e2e/*.e2e.ts` — a extensão é diferente justamente para o Jest
não executá-los.

```bash
npm run test:e2e
```

O `playwright.config.ts` carrega o `.env`, sobe `npm run dev` se nada estiver na porta
(`reuseExistingServer`) e usa o Chrome instalado na máquina (`channel: "chrome"`, trocável por
`E2E_NAVEGADOR`). O teste atual precisa de duas contas já criadas no backend e se ignora sozinho
se elas não estiverem definidas:

```ini
E2E_API_URL=http://localhost:8000
E2E_EMAIL_A=...
E2E_SENHA_A=...
E2E_EMAIL_B=...
E2E_SENHA_B=...
```

### CI

O workflow `.github/workflows/ci.yml`, na raiz do repositório, sobe tudo com Docker Compose e
roda, para o frontend: `npm run lint`, `npm test` e `npm run build`. Os testes E2E não fazem
parte do CI.

## O que o código ainda não faz

Pontos em que o frontend contorna algo que falta na API — os comentários no código citam as
issues correspondentes:

- **Não existe pagamento** (issue #23). O botão "Pagar agora" em `BotoesReserva` está
  desabilitado, o checkout vai dos passageiros direto para a confirmação e `bilheteEmitido`
  trata uma reserva pendente que já tem passageiros como bilhete emitido. Quando a rota de
  pagamento existir, basta considerar só o status `PAGO`.
- **O backend não muda o status quando o prazo acaba** (issue #20). `obterStatusAtualReserva`
  compara `expiraEm` com a hora atual para não oferecer pagamento de uma reserva vencida.
- **Não há eventos em tempo real.** O mapa de assentos é consultado a cada 5 segundos.
- **`/me/reservas/` não filtra.** `listarMinhasReservas` baixa todas as páginas porque os
  filtros e as contagens da tela precisam da lista inteira.
- **`Dockerfile.prod` não está em uso.** A etapa `builder` não roda `npm run build` e
  `next.config.ts` não tem `output: "standalone"`, então o `.next/standalone` que a etapa final
  copia não é gerado. O `docker-compose.yml` usa apenas o `Dockerfile.dev`.
- **Sobras do módulo `viagem-assento`.** Nenhuma rota chega em
  `viagem-assento/pages/SelecaoAssentosPage.tsx`, nem na cadeia que ela usa
  (`components/SelecaoAssentos.tsx`, `components/ConteudoSelecaoAssentos.tsx`,
  `hooks/useSelecaoAssentos.ts`): a tela de assentos em uso é a do módulo `reserva`, que
  importa de lá só o mapa, o resumo, o tipo e `listarViagensAssentos`. Também estão sem
  referência `viagem-assento/services/buscarAssentosDaViagem.ts` e
  `cidade/services/buscarCidade.ts`.
