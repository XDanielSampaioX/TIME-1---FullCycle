import { formatarDataHora } from "@/shared/utils/formatarDataHora";
import type { Reserva } from "../types/reserva";
import { formatarCidade } from "../utils/formatarReserva";

// Origem e destino do bilhete, cada um com o seu horário.
export function RotaDoBilhete({ viagem }: { viagem: Pick<Reserva["viagem"], "origem" | "destino" | "partidaEm" | "chegadaEm"> }) {
  return (
    <div className="reserva-bilhete-rota">
      <div>
        <small>ORIGEM</small>
        <strong>{formatarCidade(viagem.origem)}</strong>
        <time dateTime={viagem.partidaEm}>{formatarDataHora(viagem.partidaEm)}</time>
      </div>
      <span aria-hidden="true">➔</span>
      <div>
        <small>DESTINO</small>
        <strong>{formatarCidade(viagem.destino)}</strong>
        <time dateTime={viagem.chegadaEm}>{formatarDataHora(viagem.chegadaEm)}</time>
      </div>
    </div>
  );
}
