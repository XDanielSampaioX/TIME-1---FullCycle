import type { ErrosValidacao } from "../types/errosValidacao";

const MENSAGEM_PADRAO = "Verifique este campo.";

// O backend devolve uma lista de mensagens por campo; a tela mostra a primeira.
// Um texto solto (ex.: {"detail": "..."}) é usado como está, em vez de virar só a primeira letra.
// Qualquer outro formato (objeto, lista de objetos) vira uma mensagem padrão: a tela só mostra texto.
export async function lerErrosPorCampo<Dados>(resposta: Response) {
  const corpo = await resposta.json() as Record<string, unknown>;

  return Object.fromEntries(
    Object.entries(corpo).map(([campo, mensagens]) => {
      const primeira = Array.isArray(mensagens) ? mensagens[0] : mensagens;
      return [campo, typeof primeira === "string" ? primeira : MENSAGEM_PADRAO];
    }),
  ) as ErrosValidacao<Dados>;
}
