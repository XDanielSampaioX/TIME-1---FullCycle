import { obterApresentacaoStatusReserva } from "@/modules/reserva/services/obterApresentacaoStatusReserva";
import type { Reserva } from "@/modules/reserva/types/reserva";
import { formatarDataHora } from "@/shared/utils/formatarDataHora";
import { formatarValorEmReais } from "@/shared/utils/formatarValorEmReais";

type CardReservaProps = {
  reserva: Reserva;
  onCancelar: (id: number) => void;
};

export function CardReserva({ reserva, onCancelar }: CardReservaProps) {
  const apresentacao = obterApresentacaoStatusReserva(reserva.status);
  const podeCancelar = reserva.id !== undefined && reserva.status === "PAGAMENTO_PENDENTE";
  const referencia = reserva.id ? `#ROT-${String(reserva.id).padStart(8, "0")}` : "Reserva em processamento";
  const data = reserva.criadoEm ? formatarDataHora(reserva.criadoEm) : "Data a confirmar";
  const valor = formatarValorEmReais(reserva.valorTotal ?? 0);

  return (
    <article className={`reserva-card reserva-card-${apresentacao.classe}`}>
      <header className="reserva-card-header">
        <div className="reserva-status-line">
          <span className="reserva-status">{apresentacao.titulo}</span>
          <span>{apresentacao.descricao}</span>
        </div>
        <small>{referencia}</small>
      </header>
      <div className="reserva-card-body">
        <div className="reserva-route">
          <strong>Viagem #{reserva.viagemId}</strong>
          <span aria-hidden="true">→</span>
          <strong>Destino a confirmar</strong>
          <small>{data}</small>
        </div>
        <dl className="reserva-details">
          <div>
            <dt>Passageiro</dt>
            <dd>Usuário #{reserva.usuarioId}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{reserva.status.replaceAll("_", " ")}</dd>
          </div>
        </dl>
        <div className="reserva-actions">
          <div>
            <small>Valor total</small>
            <strong>{valor}</strong>
          </div>
          <div>
            {podeCancelar &&
              <button className="reserva-action reserva-action-secondary" type="button" onClick={() => onCancelar(reserva.id as number)}>Cancelar</button>
            }
            {apresentacao.acaoPrincipal &&
              <button className="reserva-action reserva-action-primary" type="button">{apresentacao.acaoPrincipal === "PAGAR" ? "Pagar agora" : apresentacao.acaoPrincipal === "BILHETES" ? "Ver bilhetes" : apresentacao.acaoPrincipal === "TENTAR_NOVAMENTE" ? "Tentar de novo" : "Buscar novamente"}</button>
            }
          </div>
        </div>
      </div>
    </article>
  );
}
