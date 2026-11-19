// Origem fictícia: serve só para o URL interpretar o caminho. Se o valor apontar para outro site
// (ex.: "//site.com", "/\site.com"), a origem muda e o valor é recusado.
const ORIGEM_INTERNA = "http://rotae.interno";

// Voltar para uma tela de acesso depois de entrar ou de criar a conta mostraria o formulário de novo.
const TELAS_DE_ACESSO = ["/login", "/cadastro"];

// O ?voltar= vem do endereço, e qualquer pessoa pode montar um link com ele.
// Por isso só aceitamos caminhos deste site; o resto volta para a página inicial.
export function destinoAposLogin(voltar: string | string[] | undefined) {
  if (typeof voltar !== "string" || !voltar.startsWith("/")) return "/";
  // Endereço malformado (ex.: "//["): new URL lançaria erro e derrubaria a página no servidor.
  if (!URL.canParse(voltar, ORIGEM_INTERNA)) return "/";

  const url = new URL(voltar, ORIGEM_INTERNA);
  // Sem a barra final, para "/login/" também ser reconhecido como tela de acesso.
  if (url.origin !== ORIGEM_INTERNA || TELAS_DE_ACESSO.includes(url.pathname.replace(/\/+$/, ""))) return "/";

  const destino = `${url.pathname}${url.search}${url.hash}`;
  // Depois de normalizar ("/.//site.com" vira "//site.com"), o caminho não pode apontar para outro site.
  if (destino.startsWith("//") || destino.startsWith("/\\")) return "/";

  return destino;
}

// Link para o login que traz o usuário de volta a esta tela depois de entrar.
export function caminhoDoLogin(voltar: string) {
  return `/login?${new URLSearchParams({ voltar })}`;
}

// Link para o cadastro que traz o usuário de volta a esta tela depois de criar a conta.
export function caminhoDoCadastro(voltar: string) {
  return `/cadastro?${new URLSearchParams({ voltar })}`;
}
