const formatadorDeDataHora = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatarDataHora(data: Date | string) {
  return formatadorDeDataHora.format(new Date(data));
}
