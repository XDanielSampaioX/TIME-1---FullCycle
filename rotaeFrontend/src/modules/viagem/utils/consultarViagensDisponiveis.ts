import type { BuscaViagem } from "../types/buscaViagem";
import type { Viagem } from "../types/viagem";
import type { ViagemDisponivel } from "../types/viagemDisponivel";

export function consultarViagensDisponiveis(
  viagens: Viagem[],
  busca: BuscaViagem,
  agora = Date.now(),
): ViagemDisponivel[] {
  const corresponde = (cidade: Viagem["origem"], termo: string) => {
    if (!termo || String(cidade.id) === termo) return true;

    const nomeNormalizado = `${cidade.nome} (${cidade.uf})`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase("pt-BR");
    const termoNormalizado = termo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase("pt-BR");

    return nomeNormalizado.includes(termoNormalizado);
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
