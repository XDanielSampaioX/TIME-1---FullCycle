import type { Reserva } from "../../types/reserva";

export function criarReservaFalsa(dados: Partial<Reserva> = {}): Reserva {
  return {
    id: 5087,
    viagem: {
      id: 7,
      origem: { id: 1, nome: "São Paulo", uf: "SP", imagemUrl: null },
      destino: { id: 2, nome: "Rio de Janeiro", uf: "RJ", imagemUrl: null },
      onibus: { id: "1", identificacao: "ROT-1", modelo: "Marcopolo", totalAssentos: 40 },
      classe: "EXECUTIVA",
      partidaEm: "2026-12-18T22:30:00-03:00",
      chegadaEm: "2026-12-19T04:50:00-03:00",
      duracao: 380,
      precoCentavos: 12400,
      status: "AGENDADA",
    },
    status: "PAGAMENTO_PENDENTE",
    valorTotal: 24800,
    expiraEm: "2026-11-04T10:00:00-03:00",
    assentos: [
      { id: 45, assentoId: 45, numero: 45, status: "SEGURADO" },
      { id: 46, assentoId: 46, numero: 46, status: "SEGURADO" },
    ],
    totalAssentos: 2,
    criadoEm: "2026-11-03T10:00:00-03:00",
    atualizadoEm: "2026-11-03T10:00:00-03:00",
    ...dados,
  };
}
