import type { Sessao } from "../types/sessao";

const CHAVE_SESSAO = "rotae.sessao";

// Com "Lembrar de mim", a sessão fica no localStorage: continua salva ao fechar o navegador e vale para todas as abas.
// Sem ele, fica no sessionStorage: o navegador apaga ao fechar a aba (mais seguro em computador compartilhado).
function guardaDaSessao() {
  return localStorage.getItem(CHAVE_SESSAO) !== null ? localStorage : sessionStorage;
}

function avisarMudanca() {
  window.dispatchEvent(new Event("storage"));
}

export function lerSessaoSalva() {
  return localStorage.getItem(CHAVE_SESSAO) ?? sessionStorage.getItem(CHAVE_SESSAO);
}

export function lerSessao() {
  const sessaoSalva = lerSessaoSalva();

  return sessaoSalva ? JSON.parse(sessaoSalva) as Sessao : null;
}

// Antes de salvar, limpa as duas guardas: nunca sobra a sessão de outra pessoa no mesmo navegador.
export function salvarSessao(sessao: Sessao, lembrar: boolean) {
  localStorage.removeItem(CHAVE_SESSAO);
  sessionStorage.removeItem(CHAVE_SESSAO);
  (lembrar ? localStorage : sessionStorage).setItem(CHAVE_SESSAO, JSON.stringify(sessao));
  avisarMudanca();
}

// Troca só parte da sessão (tokens e/ou usuário) sobre o que está salvo agora, na mesma guarda.
export function atualizarSessao(parcial: Partial<Sessao>) {
  const sessao = lerSessao();
  if (!sessao) return;

  guardaDaSessao().setItem(CHAVE_SESSAO, JSON.stringify({ ...sessao, ...parcial }));
  avisarMudanca();
}

export function removerSessao() {
  localStorage.removeItem(CHAVE_SESSAO);
  sessionStorage.removeItem(CHAVE_SESSAO);
  avisarMudanca();
}

export function acompanharSessao(aoMudar: () => void) {
  window.addEventListener("storage", aoMudar);
  return () => window.removeEventListener("storage", aoMudar);
}
