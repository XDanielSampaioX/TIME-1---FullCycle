import type { Cidade } from "@/modules/cidade/types/cidade";
import type { BuscaViagem } from "../types/buscaViagem";
import type { Viagem } from "../types/viagem";
import { consultarViagensDisponiveis } from "../utils/consultarViagensDisponiveis";

const agora = Date.parse("2026-10-05T12:00:00.000Z");

const origem: Cidade = {
  id: 1,
  nome: "Fortaleza",
  uf: "CE",
  imagemUrl: null,
};

const destino: Cidade = {
  id: 2,
  nome: "Sobral",
  uf: "CE",
  imagemUrl: null,
};

const buscaVazia: BuscaViagem = {
  origem: "",
  destino: "",
  partida: "",
};

function criarViagem(alteracoes: Partial<Viagem> = {}): Viagem {
  return {
    id: 7,
    origem,
    destino,
    onibus: {
      id: "onibus-1",
      identificacao: "ABC1234",
      modelo: "Marcopolo",
      totalAssentos: 40,
    },
    classe: "EXECUTIVA",
    partidaEm: "2026-10-05T14:00:00.000Z",
    chegadaEm: "2026-10-05T18:15:00.000Z",
    duracao: 255,
    precoCentavos: 7490,
    status: "AGENDADA",
    assentosLivres: 3,
    ...alteracoes,
  };
}

describe("consultarViagensDisponiveis", () => {
  it("retorna uma viagem agendada, futura e com dados válidos", () => {
    const viagem = criarViagem();

    expect(consultarViagensDisponiveis([viagem], buscaVazia, agora)).toEqual([viagem]);
  });

  it("filtra pela data e exige assentos suficientes para todos os passageiros", () => {
    const viagem = criarViagem();

    expect(consultarViagensDisponiveis([viagem], {
      ...buscaVazia,
      partida: "2026-10-05",
      passageiros: 3,
    }, agora)).toEqual([viagem]);

    expect(consultarViagensDisponiveis([viagem], {
      ...buscaVazia,
      partida: "2026-10-06",
    }, agora)).toEqual([]);

    expect(consultarViagensDisponiveis([viagem], {
      ...buscaVazia,
      passageiros: 4,
    }, agora)).toEqual([]);
  });

  it("encontra cidades por ID ou por nome sem diferenciar acentos e maiúsculas", () => {
    const viagem = criarViagem({
      origem: { ...origem, nome: "São Paulo", uf: "SP" },
      destino: { ...destino, nome: "Rio de Janeiro", uf: "RJ" },
    });

    expect(consultarViagensDisponiveis([viagem], {
      ...buscaVazia,
      origem: "1",
      destino: "2",
    }, agora)).toEqual([viagem]);

    expect(consultarViagensDisponiveis([viagem], {
      ...buscaVazia,
      origem: "sao paulo",
      destino: "RIO",
    }, agora)).toEqual([viagem]);
  });

  it.each([
    ["status diferente de AGENDADA", criarViagem({ status: "CANCELADA" })],
    ["partida no passado", criarViagem({ partidaEm: "2026-10-05T11:59:59.000Z" })],
    ["chegada anterior à partida", criarViagem({ chegadaEm: "2026-10-05T13:59:59.000Z" })],
    ["preço fracionário", criarViagem({ precoCentavos: 7490.5 })],
    ["preço negativo", criarViagem({ precoCentavos: -1 })],
    ["origem e destino iguais", criarViagem({ destino: origem })],
    ["nenhum assento livre", criarViagem({ assentosLivres: 0 })],
  ])("descarta uma viagem com %s", (_motivo, viagem) => {
    expect(consultarViagensDisponiveis([viagem], buscaVazia, agora)).toEqual([]);
  });
});
