import { apiUrl } from "@/lib/api";

export async function requisitarApi(caminho: string, opcoes: RequestInit = {}): Promise<Response> {
  const headers = new Headers(opcoes.headers);
  if (opcoes.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  return fetch(apiUrl(caminho), {
    ...opcoes,
    headers,
    credentials: "same-origin",
    cache: "no-store",
  });
}

export function exigirSucesso(resposta: Response, mensagem: string): void {
  if (!resposta.ok) throw new Error(mensagem);
}
