import { formatarDataHora } from "@/shared/utils/formatarDataHora";
import type { Reserva } from "../types/reserva";
import type { ReservaDetalhe } from "../types/reservaDetalhe";
import type { StatusReserva } from "../types/statusReserva";

const DIAS_NO_HISTORICO = 90;
const MILISSEGUNDOS_POR_DIA = 86_400_000;

// O backend ainda não troca o status quando o prazo acaba (issue #20), então a tela
// compara expiraEm com a hora atual para não oferecer pagamento de uma reserva vencida.
export function obterStatusAtualReserva(reserva: Pick<Reserva, "status" | "expiraEm">, agora: Date): StatusReserva {
  if (reserva.status === "PAGAMENTO_PENDENTE" && Date.parse(reserva.expiraEm) <= agora.getTime()) return "EXPIRADO";
  return reserva.status;
}

// Mostra o bilhete com QR Code. O backend ainda não tem pagamento (issue #23) e o checkout pula
// essa etapa, então a reserva pendente que já tem passageiros também conta como emitida.
// Quando o pagamento existir, basta deixar só o status PAGO.
export function bilheteEmitido(reserva: Pick<ReservaDetalhe, "status" | "expiraEm" | "passageiros">, agora: Date) {
  const statusAtual = obterStatusAtualReserva(reserva, agora);

  return statusAtual === "PAGO" || (statusAtual === "PAGAMENTO_PENDENTE" && reserva.passageiros.length > 0);
}

// Regra combinada com o backend, que não guarda qual poltrona é de qual passageiro: o primeiro
// passageiro enviado fica com a menor poltrona, o segundo com a seguinte e assim por diante.
export function ordenarAssentos<T extends { numero: number }>(assentos: T[]) {
  return [...assentos].sort((a, b) => a.numero - b.numero);
}

// Uma passagem por passageiro e poltrona, pareados como o backend faz. A reserva cancelada perde
// as poltronas e a ainda sem passageiros só tem as poltronas, por isso os dois lados podem faltar.
export function montarPassagens(reserva: Pick<ReservaDetalhe, "assentos" | "passageiros">) {
  const assentos = ordenarAssentos(reserva.assentos);
  const total = Math.max(assentos.length, reserva.passageiros.length, 1);

  return Array.from({ length: total }, (_, indice) => ({
    passageiro: reserva.passageiros[indice] as ReservaDetalhe["passageiros"][number] | undefined,
    assento: assentos[indice] as ReservaDetalhe["assentos"][number] | undefined,
  }));
}

function estaNasProximas(reserva: Reserva, agora: Date) {
  const statusAtual = obterStatusAtualReserva(reserva, agora);

  return (statusAtual === "PAGAMENTO_PENDENTE" || statusAtual === "PAGO")
    && Date.parse(reserva.viagem.partidaEm) > agora.getTime();
}

// Próximas: pendentes ou pagas com viagem futura. Histórico: as demais dos últimos 90 dias.
export function separarReservas(reservas: Reserva[], agora: Date) {
  const inicioDoHistorico = agora.getTime() - DIAS_NO_HISTORICO * MILISSEGUNDOS_POR_DIA;

  return {
    proximas: reservas.filter((reserva) => estaNasProximas(reserva, agora)),
    historico: reservas.filter((reserva) => !estaNasProximas(reserva, agora)
      && Date.parse(reserva.viagem.partidaEm) >= inicioDoHistorico),
  };
}

// Exemplos: 12 min, 22h, 1h 30min.
function formatarTempoRestante(expiraEm: string, agora: Date) {
  const minutos = Math.max(Math.ceil((Date.parse(expiraEm) - agora.getTime()) / 60000), 1);

  if (minutos < 60) return `${minutos} min`;

  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto ? `${horas}h ${resto}min` : `${horas}h`;
}

// Textos do status mostrados no cartão e no modal.
export function descreverStatusReserva(reserva: Pick<Reserva, "status" | "expiraEm" | "atualizadoEm">, agora: Date) {
  const statusAtual = obterStatusAtualReserva(reserva, agora);
  const textos: Record<StatusReserva, { titulo: string; descricao: string }> = {
    PAGAMENTO_PENDENTE: {
      titulo: "Aguardando pagamento",
      descricao: `Conclua em até ${formatarTempoRestante(reserva.expiraEm, agora)} para garantir os assentos`,
    },
    PAGO: { titulo: "Reserva confirmada", descricao: "Bilhetes prontos para o embarque" },
    EXPIRADO: { titulo: "Prazo expirado", descricao: "O pagamento não foi concluído a tempo" },
    FALHA: { titulo: "Pagamento não aprovado", descricao: "Você pode tentar outra forma de pagamento" },
    CANCELADO: { titulo: "Reserva cancelada", descricao: `Cancelada por você em ${formatarDataHora(reserva.atualizadoEm)}` },
  };

  return { statusAtual, ...textos[statusAtual] };
}
