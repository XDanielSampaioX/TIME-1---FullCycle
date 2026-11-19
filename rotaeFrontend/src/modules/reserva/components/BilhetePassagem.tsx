import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { formatarDataHora } from "@/shared/utils/formatarDataHora";
import type { Passagem } from "../types/passagem";
import { formatarCidade, formatarCodigoReserva } from "../utils/formatarReserva";

const divisor = <Image src="/viagens/divisor-resumo.svg" width={576} height={1} alt="" />;

// O bilhete de uma passagem de reserva paga. O QR Code de embarque só aparece se a passagem estiver confirmada.
export function BilhetePassagem({ passagem }: { passagem: Passagem }) {
  const { viagem } = passagem;
  const codigo = formatarCodigoReserva({ id: passagem.id, criadoEm: passagem.criadoEm });
  const cancelada = passagem.status === "CANCELADO";

  return (
    <section className="reserva-bilhete" aria-label={`Passagem ${codigo}`}>
      <div className="reserva-bilhete-topo">
        <strong>BILHETE DIGITAL EMITIDO</strong>
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
            <dt>PASSAGEIRO</dt>
            <dd>{passagem.passageiro.nome}</dd>
          </div>
          <div>
            <dt>POLTRONA</dt>
            <dd data-destaque>{passagem.viagemAssento.numero}</dd>
          </div>
        </dl>
        {cancelada ? (
          <p role="status">Passagem cancelada</p>
        ) : (
          <>
            {divisor}
            <div className="reserva-bilhete-embarque">
              <div>
                <QRCodeSVG
                  value={codigo}
                  size={108}
                  marginSize={2}
                  level="M"
                  fgColor="#123d33"
                  bgColor="transparent"
                  role="img"
                  aria-label={`QR Code da passagem ${codigo}`}
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
