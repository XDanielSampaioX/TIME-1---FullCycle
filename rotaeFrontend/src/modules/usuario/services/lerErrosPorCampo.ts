import type { ErrosValidacao } from "../types/errosValidacao";

// O backend devolve uma lista de mensagens por campo; a tela mostra a primeira.
export async function lerErrosPorCampo<Dados>(resposta: Response) {
  const corpo = await resposta.json() as Record<string, string[]>;

  return Object.fromEntries(
    Object.entries(corpo).map(([campo, mensagens]) => [campo, mensagens[0]]),
  ) as ErrosValidacao<Dados>;
}
