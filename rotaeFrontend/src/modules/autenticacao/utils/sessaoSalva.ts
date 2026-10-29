import type { Sessao } from "../types/sessao";

const CHAVE_SESSAO = "rotae.sessao";

// A sessão fica no localStorage: sobrevive ao recarregar a página e vale para todas as abas.
export function lerSessaoSalva() {
  return localStorage.getItem(CHAVE_SESSAO);
}

export function lerSessao() {
  const sessaoSalva = lerSessaoSalva();

  return sessaoSalva ? JSON.parse(sessaoSalva) as Sessao : null;
}

export function salvarSessao(sessao: Sessao) {
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
  window.dispatchEvent(new Event("storage"));
}

// Troca só parte da sessão (tokens e/ou usuário) sobre o que está salvo agora, sem tocar no resto.
export function atualizarSessao(parcial: Partial<Sessao>) {
  const sessao = lerSessao();

  if (sessao) salvarSessao({ ...sessao, ...parcial });
}

export function removerSessao() {
  localStorage.removeItem(CHAVE_SESSAO);
  window.dispatchEvent(new Event("storage"));
}

export function acompanharSessao(aoMudar: () => void) {
  window.addEventListener("storage", aoMudar);
  return () => window.removeEventListener("storage", aoMudar);
}
