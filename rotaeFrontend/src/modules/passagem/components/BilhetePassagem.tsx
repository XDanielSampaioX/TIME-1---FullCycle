import { QRCodeSVG } from "qrcode.react";
import type { Passagem } from "../types/passagem";
import { formatarCodigoReserva } from "@/modules/reserva/utils/formatarReserva";
import { DivisorBilhete } from "@/modules/reserva/components/DivisorBilhete";
import { RotaDoBilhete } from "@/modules/reserva/components/RotaDoBilhete";

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
        <RotaDoBilhete viagem={viagem} />
        <DivisorBilhete />
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
          <p>Passagem cancelada</p>
        ) : (
          <>
            <DivisorBilhete />
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
