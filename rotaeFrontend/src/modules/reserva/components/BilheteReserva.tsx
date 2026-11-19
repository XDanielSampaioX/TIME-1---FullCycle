import Image from "next/image";
import { formatarDataHora } from "@/shared/utils/formatarDataHora";
import type { ReservaDetalhe } from "../types/reservaDetalhe";
import { formatarCidade, formatarCodigoReserva, formatarNomesPassageiros, formatarPoltronas } from "../utils/formatarReserva";

const divisor = <Image src="/viagens/divisor-resumo.svg" width={576} height={1} alt="" />;

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
          {divisor}
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
