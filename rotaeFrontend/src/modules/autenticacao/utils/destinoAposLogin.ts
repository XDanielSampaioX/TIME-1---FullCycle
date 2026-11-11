// Origem fictícia: serve só para o URL interpretar o caminho. Se o valor apontar para outro site
// (ex.: "//site.com", "/\site.com"), a origem muda e o valor é recusado.
const ORIGEM_INTERNA = "http://rotae.interno";

// O ?voltar= vem do endereço, e qualquer pessoa pode montar um link com ele.
// Por isso só aceitamos caminhos deste site; o resto volta para a página inicial.
export function destinoAposLogin(voltar: string | string[] | undefined) {
  if (typeof voltar !== "string" || !voltar.startsWith("/")) return "/";

  const url = new URL(voltar, ORIGEM_INTERNA);
  if (url.origin !== ORIGEM_INTERNA || url.pathname === "/login") return "/";

  return `${url.pathname}${url.search}${url.hash}`;
}

// Link para o login que traz o usuário de volta a esta tela depois de entrar.
export function caminhoDoLogin(voltar: string) {
  return `/login?${new URLSearchParams({ voltar })}`;
}
