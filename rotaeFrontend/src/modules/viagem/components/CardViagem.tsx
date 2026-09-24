import type { Viagem } from "@/modules/viagem/types/viagem";

function formatarPreco(precoCentavos: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    precoCentavos / 100,
  );
}

export function CardViagem({ viagem }: { viagem: Viagem }) {
  return (
    <article className="viagem-card">
      <div>
        <strong>Viagem #{viagem.id}</strong>
        <span className="viagem-status">{viagem.status}</span>
      </div>
      <h2>Cidade {viagem.origemId} → Cidade {viagem.destinoId}</h2>
      {viagem.classe && <p>Classe: {viagem.classe}</p>}
      <p>Partida: {new Date(viagem.partidaEm).toLocaleString("pt-BR")}</p>
      <p>Chegada: {new Date(viagem.chegadaEm).toLocaleString("pt-BR")}</p>
      <strong>{formatarPreco(viagem.precoCentavos)}</strong>
    </article>
  );
}
