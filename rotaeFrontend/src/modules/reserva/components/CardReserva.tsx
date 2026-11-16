import { formatarDataHora } from "@/shared/utils/formatarDataHora";
import { formatarValorEmReais } from "@/shared/utils/formatarValorEmReais";
import type { Reserva } from "../types/reserva";
import { formatarCidade, formatarCodigoReserva, formatarNomesPassageiros, formatarPoltronas } from "../utils/formatarReserva";
import { descreverStatusReserva } from "../utils/regrasReserva";
import { BotoesReserva } from "./BotoesReserva";

// Um cartão da lista: status, rota, passageiros, assentos, valor e botões.
export function CardReserva({ reserva, agora, compacto, aoVerDetalhes, aoAtualizar }: {
  reserva: Reserva;
  agora: Date;
  compacto: boolean;
  aoVerDetalhes: () => void;
  aoAtualizar: () => void;
}) {
  const { viagem } = reserva;
  const { statusAtual, titulo, descricao } = descreverStatusReserva(reserva, agora);
  const codigo = formatarCodigoReserva(reserva);

  return (
    <article className="reserva-card" data-status={statusAtual} data-compacto={compacto} aria-label={`Reserva ${codigo}`}>
      <div className="reserva-card-topo">
        <div className="reserva-card-estado">
          <span className="reserva-status">
            <i aria-hidden="true" />
            {titulo}
          </span>
          <span>{descricao}</span>
        </div>
        <strong className="reserva-codigo">{codigo}</strong>
      </div>
      <div className="reserva-card-info">
        <div className="reserva-rota">
          <div className="reserva-cidades">
            <strong>{formatarCidade(viagem.origem)}</strong>
            <span aria-hidden="true">→</span>
            <strong>{formatarCidade(viagem.destino)}</strong>
          </div>
          <div className="reserva-horarios">
            <time dateTime={viagem.partidaEm}>{formatarDataHora(viagem.partidaEm)}</time>
            <span aria-hidden="true">•••</span>
            <time dateTime={viagem.chegadaEm}>{formatarDataHora(viagem.chegadaEm)}</time>
          </div>
        </div>
        <dl className="reserva-passagens">
          <div>
            <dt>Passageiros</dt>
            <dd>{reserva.passageiros.length ? formatarNomesPassageiros(reserva.passageiros) : "Não informados"}</dd>
          </div>
          <div>
            <dt>Assentos</dt>
            <dd>{formatarPoltronas(reserva.assentos)}</dd>
          </div>
        </dl>
        <div className="reserva-valor">
          <div className="reserva-total">
            <small>Valor total</small>
            <strong>{formatarValorEmReais(reserva.valorTotal)}</strong>
          </div>
          <BotoesReserva
            reserva={reserva}
            statusAtual={statusAtual}
            semPassageiros={reserva.passageiros.length === 0}
            aoVerDetalhes={aoVerDetalhes}
            aoAtualizar={aoAtualizar}
          />
        </div>
      </div>
    </article>
  );
}
