import type { ReservaDetalhe } from "../types/reservaDetalhe";
import { formatarCodigoReserva, formatarNomesPassageiros, formatarPoltronas } from "../utils/formatarReserva";
import { DivisorBilhete } from "./DivisorBilhete";
import { RotaDoBilhete } from "./RotaDoBilhete";

// Detalhes da reserva que ainda não foi paga: um bloco só, com todos os passageiros e poltronas.
// O backend só emite as passagens (e o QR Code) depois do pagamento.
export function BilheteReserva({ reserva }: { reserva: ReservaDetalhe }) {
  const { viagem } = reserva;
  const nomes = reserva.passageiros.map((passageiro) => passageiro.nome);

  return (
    <div className="reserva-bilhetes">
      <section className="reserva-bilhete" aria-label="Detalhes da reserva">
        <div className="reserva-bilhete-topo">
          <strong>DETALHES DA RESERVA</strong>
          <span>{formatarCodigoReserva(reserva)}</span>
        </div>
        <div className="reserva-bilhete-corpo">
          <RotaDoBilhete viagem={viagem} />
          <DivisorBilhete />
          <dl className="reserva-bilhete-dados">
            <div>
              <dt>PASSAGEIROS</dt>
              <dd>{nomes.length ? formatarNomesPassageiros(nomes) : "Não informados"}</dd>
            </div>
            <div>
              <dt>POLTRONAS</dt>
              <dd data-destaque>{formatarPoltronas(reserva.assentos)}</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
