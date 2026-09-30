import type { Assento } from "@/modules/assento/types/assento";
import type { Cidade } from "@/modules/cidade/types/cidade";
import type { ViagemAssento } from "@/modules/viagem-assento/types/viagemAssento";
import type { BuscaViagem } from "../types/buscaViagem";
import type { Viagem } from "../types/viagem";
import type { ViagemDisponivel } from "../types/viagemDisponivel";

export function consultarViagensDisponiveis(
  viagens: Viagem[],
  cidades: Cidade[],
  assentos: Assento[],
  assentosViagens: ViagemAssento[],
  busca: BuscaViagem,
  agora = Date.now(),
): ViagemDisponivel[] {
  const normalizar = (texto: string) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase("pt-BR");
  const corresponde = (cidade: Cidade, termo: string) => !termo
    || String(cidade.id) === termo
    || normalizar(`${cidade.nome} (${cidade.uf})`).includes(normalizar(termo));

  return viagens.flatMap((viagem) => {
    const origem = cidades.find((cidade) => cidade.id === viagem.origemId);
    const destino = cidades.find((cidade) => cidade.id === viagem.destinoId);

    if (viagem.id === undefined || viagem.status !== "AGENDADA"
      || !(Date.parse(viagem.partidaEm) > agora)
      || !(Date.parse(viagem.chegadaEm) > Date.parse(viagem.partidaEm))
      || !Number.isInteger(viagem.precoCentavos) || viagem.precoCentavos < 0
      || !origem || !destino || origem.id === destino.id
      || !corresponde(origem, busca.origem) || !corresponde(destino, busca.destino)
      || (busca.partida && viagem.partidaEm.slice(0, 10) !== busca.partida)) {
      return [];
    }

    const assentosLivres = new Set(assentosViagens
      .filter((item) => item.viagemId === viagem.id && item.status === "DISPONIVEL"
        && assentos.some((assento) => assento.id === item.assentoId && assento.onibusId === viagem.onibusId))
      .map((item) => item.assentoId)).size;

    return assentosLivres >= busca.passageiros ? [{ viagem, origem, destino, assentosLivres }] : [];
  });
}
