export function normalizarTexto(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLocaleLowerCase("pt-BR");
}
