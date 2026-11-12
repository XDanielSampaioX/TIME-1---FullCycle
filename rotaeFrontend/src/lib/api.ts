import type { Pagina } from "@/shared/types/pagina";

export function apiUrl(path: string) {
  const url = new URL(path, window.location.origin);
  return url.pathname + url.search;
}

export async function buscarPagina<T>(caminhoOuUrl: string, mensagemErro: string): Promise<Pagina<T>> {
  const url = apiUrl(caminhoOuUrl);
  const resposta = await fetch(url);

  if (!resposta.ok) throw new Error(mensagemErro);
  return resposta.json() as Promise<Pagina<T>>;
}

export async function listarResultadosPaginados<T>(caminho: string, mensagemErro: string): Promise<T[]> {
  const resultados: T[] = [];
  let url: string | null = caminho;

  while (url) {
    const pagina: Pagina<T> = await buscarPagina<T>(url, mensagemErro);
    resultados.push(...pagina.results);
    url = pagina.next;
  }

  return resultados;
}
