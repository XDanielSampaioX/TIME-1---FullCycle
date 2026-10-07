const formatadorDeValorEmReais = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatarValorEmReais(valorEmCentavos: number) {
  return formatadorDeValorEmReais.format(valorEmCentavos / 100);
}
