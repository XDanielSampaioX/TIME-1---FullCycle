import type { TokensSessao } from "@/modules/autenticacao/types/tokenUser";

export function autenticarNoBackend(caminho: string, opcoes: RequestInit = {}) {
  const urlBase = process.env.API_URL ?? "http://backend:8000";
  const headers = new Headers(opcoes.headers);
  if (opcoes.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return fetch(new URL(caminho, urlBase), { ...opcoes, headers, cache: "no-store" });
}

export function tokensValidos(valor: unknown): valor is TokensSessao {
  if (!valor || typeof valor !== "object") return false;
  const tokens = valor as Record<string, unknown>;
  return typeof tokens.access === "string" && tokens.access.length > 0
    && typeof tokens.refresh === "string" && tokens.refresh.length > 0;
}

export function origemPermitida(request: Request): boolean {
  const origem = request.headers.get("origin");
  return !origem || origem === new URL(request.url).origin;
}
