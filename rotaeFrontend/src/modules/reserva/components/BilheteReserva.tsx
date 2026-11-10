import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { formatarDataHora } from "@/shared/utils/formatarDataHora";
import { formatarValorEmReais } from "@/shared/utils/formatarValorEmReais";
import type { ReservaDetalhe } from "../types/reservaDetalhe";
import { formatarCidade, formatarClasse, formatarCodigoReserva, formatarNomesPassageiros, formatarPoltronas } from "../utils/formatarReserva";

const divisor = <Image src="/viagens/divisor-resumo.svg" width={576} height={1} alt="" />;

// O bilhete da confirmação e do modal de detalhes. O bilhete emitido também mostra o QR Code.
export function BilheteReserva({ reserva, emitido }: { reserva: ReservaDetalhe; emitido: boolean }) {
  const { viagem, passageiros, assentos } = reserva;
  const codigo = formatarCodigoReserva(reserva);

  return (
    <section className="reserva-bilhete" aria-label="Dados da reserva">
      <div className="reserva-bilhete-topo">
        <strong>{emitido ? "BILHETE DIGITAL EMITIDO" : "DETALHES DA RESERVA"}</strong>
        <span>{codigo}</span>
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
            <dt>{passageiros.length > 1 ? "PASSAGEIROS" : "PASSAGEIRO"}</dt>
            <dd>{passageiros.length ? formatarNomesPassageiros(passageiros) : "Não informado"}</dd>
          </div>
          <div>
            <dt>CLASSE</dt>
            <dd>{formatarClasse(viagem)}</dd>
          </div>
          <div>
            <dt>{assentos.length > 1 ? "POLTRONAS" : "POLTRONA"}</dt>
            <dd data-destaque>{formatarPoltronas(assentos)}</dd>
          </div>
          <div>
            <dt>{reserva.status === "PAGO" ? "VALOR PAGO" : "VALOR TOTAL"}</dt>
            <dd>{formatarValorEmReais(reserva.valorTotal)}</dd>
          </div>
        </dl>
        {emitido && (
          <>
            {divisor}
            <div className="reserva-bilhete-embarque">
              <div>
                {/* O código deriva do id da reserva, então cada bilhete tem o seu QR Code. */}
                <QRCodeSVG
                  value={codigo}
                  size={108}
                  marginSize={2}
                  level="M"
                  fgColor="#123d33"
                  bgColor="transparent"
                  role="img"
                  aria-label={`QR Code da reserva ${codigo}`}
                />
              </div>
              <p>
                <strong>Apresente este bilhete no embarque</strong>
                Não é necessário imprimir. Tenha em mãos seu documento oficial com foto.
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
