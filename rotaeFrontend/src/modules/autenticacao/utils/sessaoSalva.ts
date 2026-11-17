import type { Sessao } from "../types/sessao";

const CHAVE_SESSAO = "rotae.sessao";

// Com "Lembrar de mim", a sessão fica no localStorage: continua salva ao fechar o navegador e vale para todas as abas.
// Sem ele, fica no sessionStorage da aba: o navegador apaga ao fechar a aba e as outras abas não a enxergam.
// A sessão desta aba vem antes da compartilhada: assim um login em outra aba nunca troca o usuário desta.
function guardaDaSessao() {
  return sessionStorage.getItem(CHAVE_SESSAO) !== null ? sessionStorage : localStorage;
}

function avisarMudanca() {
  window.dispatchEvent(new Event("storage"));
}

export function lerSessaoSalva() {
  return sessionStorage.getItem(CHAVE_SESSAO) ?? localStorage.getItem(CHAVE_SESSAO);
}

// Converte o texto salvo em sessão. Valor corrompido (extensão, edição manual, gravação cortada) vira null,
// para o app tratar como visitante em vez de quebrar. Não grava nada: pode ser usada durante a renderização.
export function interpretarSessao(sessaoSalva: string | null): Sessao | null {
  if (!sessaoSalva) return null;

  try {
    const sessao: unknown = JSON.parse(sessaoSalva);
    const valida = typeof sessao === "object" && sessao !== null
      && "access" in sessao && typeof sessao.access === "string"
      && "refresh" in sessao && typeof sessao.refresh === "string"
      && "user" in sessao && typeof sessao.user === "object" && sessao.user !== null;

    return valida ? sessao as Sessao : null;
  } catch {
    return null;
  }
}

export function lerSessao() {
  const sessaoSalva = lerSessaoSalva();
  const sessao = interpretarSessao(sessaoSalva);

  // Valor corrompido: descarta, para o app voltar ao estado de visitante.
  if (sessaoSalva !== null && !sessao) removerSessao();

  return sessao;
}

// Limpa só a sessão desta aba e grava na guarda escolhida: um login sem "Lembrar de mim"
// aqui não derruba quem está lembrado nas outras abas.
export function salvarSessao(sessao: Sessao, lembrar: boolean) {
  sessionStorage.removeItem(CHAVE_SESSAO);
  (lembrar ? localStorage : sessionStorage).setItem(CHAVE_SESSAO, JSON.stringify(sessao));
  avisarMudanca();
}

// Troca só parte da sessão (tokens e/ou usuário), na mesma guarda. Só aplica se a sessão salva ainda for
// do usuário que pediu: se outra aba gravou outro usuário no meio do caminho, a atualização é descartada.
export function atualizarSessao(parcial: Partial<Sessao>, idUsuario: number) {
  const sessao = lerSessao();
  if (!sessao || sessao.user.id !== idUsuario) return;

  guardaDaSessao().setItem(CHAVE_SESSAO, JSON.stringify({ ...sessao, ...parcial }));
  avisarMudanca();
}

// Sair apaga as duas guardas: depois de sair, esta aba não pode cair na sessão lembrada de outra pessoa.
export function removerSessao() {
  sessionStorage.removeItem(CHAVE_SESSAO);
  localStorage.removeItem(CHAVE_SESSAO);
  avisarMudanca();
}

export function acompanharSessao(aoMudar: () => void) {
  window.addEventListener("storage", aoMudar);
  return () => window.removeEventListener("storage", aoMudar);
}
