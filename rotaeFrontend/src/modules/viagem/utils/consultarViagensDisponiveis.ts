import type { BuscaViagem } from "../types/buscaViagem";
import type { Viagem, ViagemDisponivel } from "../types/viagem";
import { formatarNomeCidade } from "./formatarNomeCidade";
import { normalizarTexto } from "./normalizarTexto";

export function consultarViagensDisponiveis(
  viagens: Viagem[],
  busca: BuscaViagem,
  agora = Date.now(),
): ViagemDisponivel[] {
  const corresponde = (cidade: Viagem["origem"], termo: string) => {
    if (!termo || String(cidade.id) === termo) return true;

    return normalizarTexto(formatarNomeCidade(cidade)).includes(normalizarTexto(termo));
  };

  return viagens.filter((viagem) => viagem.status === "AGENDADA"
    && Date.parse(viagem.partidaEm) > agora
    && Date.parse(viagem.chegadaEm) > Date.parse(viagem.partidaEm)
    && Number.isInteger(viagem.precoCentavos) && viagem.precoCentavos >= 0
    && viagem.origem.id !== viagem.destino.id
    && corresponde(viagem.origem, busca.origem)
    && corresponde(viagem.destino, busca.destino)
    && (!busca.partida || viagem.partidaEm.slice(0, 10) === busca.partida)
    && viagem.assentosLivres >= (busca.passageiros ?? 1));
}
