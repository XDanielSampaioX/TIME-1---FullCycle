import Image from "next/image";
import Link from "next/link";
import type { ViagemDisponivel } from "../types/viagemDisponivel";
import type { BuscaViagem } from "../types/buscaViagem";

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
            <span>{origem.nome} ({origem.uf})</span>
          </div>
          <div className="viagem-duracao">
            <span>{Math.floor(viagem.duracao / 60)}h{String(viagem.duracao % 60).padStart(2, "0")}</span>
            <Image src="/viagens/trajeto.svg" width={72} height={6} alt="" />
            <small>{viagem.partidaEm.slice(0, 10) === viagem.chegadaEm.slice(0, 10) ? "MESMO DIA" : "DIA SEGUINTE"}</small>
          </div>
          <div>
            <time dateTime={viagem.chegadaEm}>{viagem.chegadaEm.slice(11, 16)}</time>
            <span>{destino.nome} ({destino.uf})</span>
          </div>
        </div>
        <div className="viagem-classe">
          <span className="viagem-badge">{viagem.classe === "EXECUTIVA" ? "Executiva" : viagem.classe === "CONVENCIONAL" ? "Convencional" : "Classe não informada"}</span>
          <small>{assentosLivres} {assentosLivres === 1 ? "assento livre" : "assentos livres"}</small>
        </div>
        <div className="viagem-compra">
          <div>
            <small>Por passageiro</small>
            <strong>{(viagem.precoCentavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
          </div>
          <Link className="viagem-selecionar" href={`/viagens/${viagem.id}/assentos?${parametros}`}>
            Selecionar
          </Link>
        </div>
      </div>
    </article>
  );
}
