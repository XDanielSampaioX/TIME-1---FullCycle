<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Regra de responsabilidade única do frontend

- Cada tipo ou contrato TypeScript com responsabilidade própria deve ficar em um arquivo separado dentro do módulo funcional.
- Reutilizar o mesmo tipo quando entidade e payload tiverem o mesmo contrato; criar tipos separados somente quando houver responsabilidade ou formato realmente diferente.
- Serviços também devem ser separados por caso de uso ou funcionalidade, mantendo uma responsabilidade por arquivo.
