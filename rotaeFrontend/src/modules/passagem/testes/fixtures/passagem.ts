import type { Passagem } from "../../types/passagem";

export function criarPassagemFalsa(dados: Partial<Passagem> = {}): Passagem {
  return {
    id: 12,
    reservaId: 5087,
    viagem: {
      origem: { id: 1, nome: "São Paulo", uf: "SP", imagemUrl: null },
      destino: { id: 2, nome: "Rio de Janeiro", uf: "RJ", imagemUrl: null },
      partidaEm: "2026-12-18T22:30:00-03:00",
      chegadaEm: "2026-12-19T04:50:00-03:00",
    },
    viagemAssento: { id: 45, numero: 45 },
    passageiro: {
      id: 1,
      usuarioId: null,
      nome: "Mariana Oliveira",
      email: "",
      celular: "",
      dataNasc: null,
      cpf: "",
      criadoEm: "2026-11-03T10:00:00-03:00",
      atualizadoEm: "2026-11-03T10:00:00-03:00",
    },
    status: "CONFIRMADO",
    criadoEm: "2026-11-03T10:00:00-03:00",
    atualizadoEm: "2026-11-03T10:00:00-03:00",
    ...dados,
  };
}
