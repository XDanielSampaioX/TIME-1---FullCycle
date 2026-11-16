import { Tokens } from "../types/sessao";
import { atualizarSessao, lerSessao, removerSessao } from "../utils/sessaoSalva";
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

    // Outra requisição já renovou os tokens enquanto esta esperava a resposta: usa os novos.
    // Renovar de novo com o refresh token antigo seria recusado (ele só vale uma vez) e encerraria a sessão.
    const atual = lerSessao();
    if (atual && atual.user.id === sessao.user.id && atual.access !== sessao.access) {
      return enviarComToken(entrada, opcoes, atual.access);
    }

    // O refresh token só vale uma vez: requisições simultâneas compartilham a mesma renovação.
    renovacao ??= renovarTokens(sessao.refresh).finally(() => {
      renovacao = null;
    });
    const tokens = await renovacao;

    if (!tokens) {
      removerSessao();
      return resposta;
    }

    // Os tokens novos são do usuário desta requisição: não valem se outra aba já trocou a sessão salva.
    atualizarSessao(tokens, sessao.user.id);
    return enviarComToken(entrada, opcoes, tokens.access);
  };
}

export const fetchAutenticado = criarProxyAutenticado((entrada, opcoes) => fetch(entrada, opcoes));
