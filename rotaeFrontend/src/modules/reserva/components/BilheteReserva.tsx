import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { formatarDataHora } from "@/shared/utils/formatarDataHora";
import { formatarValorEmReais } from "@/shared/utils/formatarValorEmReais";
import type { ReservaDetalhe } from "../types/reservaDetalhe";
import { formatarCidade, formatarClasse, formatarCodigoReserva } from "../utils/formatarReserva";
import { montarPassagens } from "../utils/regrasReserva";

const divisor = <Image src="/viagens/divisor-resumo.svg" width={576} height={1} alt="" />;

// Os bilhetes da confirmação e do modal de detalhes: um por passageiro, com a poltrona dele.
// O bilhete emitido também mostra o QR Code.
export function BilheteReserva({ reserva, emitido }: { reserva: ReservaDetalhe; emitido: boolean }) {
  const { viagem } = reserva;
  const codigo = formatarCodigoReserva(reserva);
  const passagens = montarPassagens(reserva);
  const valorDaPassagem = reserva.valorTotal / passagens.length;

  return (
    <div className="reserva-bilhetes">
      {passagens.map(({ passageiro, assento }, indice) => {
        // A poltrona entra no código, então cada passagem tem o seu QR Code.
        const codigoDaPassagem = assento ? `${codigo}-${assento.numero}` : codigo;

        return (
          <section className="reserva-bilhete" key={indice} aria-label={`Passagem ${indice + 1} de ${passagens.length}`}>
            <div className="reserva-bilhete-topo">
              <strong>{emitido ? "BILHETE DIGITAL EMITIDO" : "DETALHES DA RESERVA"}</strong>
              <span>{codigoDaPassagem}</span>
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
                  <dd>{passageiro?.nome ?? "Não informado"}</dd>
                </div>
                <div>
                  <dt>CLASSE</dt>
                  <dd>{formatarClasse(viagem)}</dd>
                </div>
                <div>
                  <dt>POLTRONA</dt>
                  <dd data-destaque>{assento?.numero ?? "—"}</dd>
                </div>
                <div>
                  <dt>{reserva.status === "PAGO" ? "VALOR PAGO" : "VALOR"}</dt>
                  <dd>{formatarValorEmReais(valorDaPassagem)}</dd>
                </div>
              </dl>
              {emitido && (
                <>
                  {divisor}
                  <div className="reserva-bilhete-embarque">
                    <div>
                      <QRCodeSVG
                        value={codigoDaPassagem}
                        size={108}
                        marginSize={2}
                        level="M"
                        fgColor="#123d33"
                        bgColor="transparent"
                        role="img"
                        aria-label={`QR Code da passagem ${codigoDaPassagem}`}
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
      })}
    </div>
  );
}
