// Recebe "AAAA-MM-DD" (formato do backend) e devolve "DD/MM/AAAA" sem passar por Date,
// para o fuso horário não mudar o dia.
export function formatarDataNascimento(data: string | null | undefined) {
  if (!data) return "Não informada";

  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}
