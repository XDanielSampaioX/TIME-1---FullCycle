import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";

// O Next lê o .env sozinho, mas o Playwright não. As contas E2E_* vêm de lá.
// Variáveis já definidas no terminal continuam valendo.
if (existsSync(".env")) process.loadEnvFile(".env");

// Testes E2E: navegador de verdade, frontend e backend rodando.
// Os arquivos ficam em src/modules/<modulo>/testes/e2e e terminam em .e2e.ts, para o Jest não executá-los.
export default defineConfig({
  testDir: "./src/modules",
  testMatch: "**/testes/e2e/**/*.e2e.ts",
  outputDir: "./test-results",
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    // Usa o Google Chrome instalado na máquina, sem baixar navegadores.
    // Para trocar, defina E2E_NAVEGADOR (ex.: msedge).
    channel: process.env.E2E_NAVEGADOR ?? "chrome",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
