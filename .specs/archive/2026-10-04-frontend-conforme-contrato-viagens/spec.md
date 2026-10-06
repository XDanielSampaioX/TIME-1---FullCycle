# Frontend conforme o contrato de viagens

## Contexto
O frontend deve consumir somente as rotas existentes do backend Django para viagens: lista paginada, cidades paginadas e assentos de uma viagem. A interface deve ler os objetos camelCase e aninhados retornados pela API.

## Regra de negócio
Não criar rotas nem converter a resposta da API para o modelo antigo. A tela de viagens deve usar os dados de viagem, cidade, ônibus e assentos diretamente do backend.

## Checklist
- [x] Carregar todas as páginas de viagens e cidades por suas rotas existentes.
- [x] Remover a dependência da rota inexistente `/api/assentos` na busca de viagens.
- [x] Atualizar busca, cards e seleção de assentos para os objetos aninhados retornados.
- [x] Verificar tipos, lint e a página `/viagens` no navegador.

## Evidências
- `tsc --noEmit` e ESLint dos módulos alterados passaram.
- A página `/viagens` exibiu as 37 viagens retornadas pela API após reiniciar o frontend.
- A rota existente `/api/v1/viagens/13/assentos/` alimentou o mapa com 32 assentos; a seleção local de uma poltrona funcionou.
- `git diff --check` não apontou erros de whitespace.

## Observações
O backend não oferece rotas para reservas ou pagamentos; esses fluxos demonstrativos permanecem fora desta integração.

Status: concluída. Arquivo em `.specs/archive/2026-10-04-frontend-conforme-contrato-viagens/`.
