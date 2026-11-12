import Image from "next/image";
import Link from "next/link";
import { ViagemDisponivel } from "../types/viagem";
import { BuscaViagem } from "../types/buscaViagem";
import { formatarNomeCidade } from "../utils/formatarNomeCidade";
import { ROTULOS_CLASSE_VIAGEM } from "../utils/rotulosClasseViagem";
import { formatarValorEmReais } from "@/shared/utils/formatarValorEmReais";

export function CardViagem({ resultado, busca, recomendado }: {
  resultado: ViagemDisponivel;
  busca: BuscaViagem;
  recomendado: boolean;
}) {
  const viagem = resultado;
  const { origem, destino, assentosLivres } = viagem;
  const parametros = new URLSearchParams({ origem: busca.origem, destino: busca.destino, partida: busca.partida });
  if (busca.passageiros !== undefined) parametros.set("passageiros", String(busca.passageiros));

  return (
    <article className="viagem-card" data-recomendado={recomendado} aria-label={`Viagem ${viagem.id}`}>
      {recomendado && (
        <div className="viagem-recomendacao">★ MELHOR PREÇO RECOMENDADO</div>
      )}
      <div className="viagem-card-corpo">
        <div className="viagem-trajeto">
          <div>
            <time dateTime={viagem.partidaEm}>{viagem.partidaEm.slice(11, 16)}</time>
            <span>{formatarNomeCidade(origem)}</span>
          </div>
          <div className="viagem-duracao">
            <span>{Math.floor(viagem.duracao / 60)}h{String(viagem.duracao % 60).padStart(2, "0")}</span>
            <Image src="/viagens/trajeto.svg" width={72} height={6} alt="" />
            <small>{viagem.partidaEm.slice(0, 10) === viagem.chegadaEm.slice(0, 10) ? "MESMO DIA" : "DIA SEGUINTE"}</small>
          </div>
          <div>
            <time dateTime={viagem.chegadaEm}>{viagem.chegadaEm.slice(11, 16)}</time>
            <span>{formatarNomeCidade(destino)}</span>
          </div>
        </div>
        <div className="viagem-classe">
          <span className="viagem-badge">{ROTULOS_CLASSE_VIAGEM[viagem.classe] ?? "Classe não informada"}</span>
          <small>{assentosLivres} {assentosLivres === 1 ? "assento livre" : "assentos livres"}</small>
        </div>
        <div className="viagem-compra">
          <div>
            <small>Por passageiro</small>
            <strong>{formatarValorEmReais(viagem.precoCentavos)}</strong>
          </div>
          <Link className="viagem-selecionar" href={`/viagens/${viagem.id}/assentos?${parametros}`}>
            Selecionar
          </Link>
        </div>
      </div>
    </article>
  );
}
