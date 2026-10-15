import { Tokens } from "../types/sessao";
import { lerSessao, removerSessao, salvarSessao } from "../utils/sessaoSalva";
import { renovarTokens } from "./renovarTokens";

// Exemplo de uso de Proxy: mesmo contrato do fetch, mas envia o token da sessão
// e, se o backend responder 401, renova os tokens e repete a requisição uma vez.
type Requisicao = typeof fetch;

function criarProxyAutenticado(requisicaoReal: Requisicao): Requisicao {
  let renovacao: Promise<Tokens | null> | null = null;

  function enviarComToken(entrada: Parameters<Requisicao>[0], opcoes: Parameters<Requisicao>[1], access: string) {
    const headers = new Headers(opcoes?.headers);
    headers.set("Authorization", `Bearer ${access}`);

    return requisicaoReal(entrada, { ...opcoes, headers });
  }

  return async (entrada, opcoes) => {
    const sessao = lerSessao();
    if (!sessao) return requisicaoReal(entrada, opcoes);

    const resposta = await enviarComToken(entrada, opcoes, sessao.access);
    if (resposta.status !== 401) return resposta;

    // O refresh token só vale uma vez: requisições simultâneas compartilham a mesma renovação.
    renovacao ??= renovarTokens(sessao.refresh).finally(() => {
      renovacao = null;
    });
    const tokens = await renovacao;

    if (!tokens) {
      removerSessao();
      return resposta;
    }

    salvarSessao({ ...sessao, ...tokens });
    return enviarComToken(entrada, opcoes, tokens.access);
  };
}

export const fetchAutenticado = criarProxyAutenticado((entrada, opcoes) => fetch(entrada, opcoes));
