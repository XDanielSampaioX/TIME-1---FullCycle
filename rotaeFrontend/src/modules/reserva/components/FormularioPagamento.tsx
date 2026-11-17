"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { Button } from "@/shared/components/Button";
import type { usePagamento } from "../hooks/usePagamento";
import type { MetodoPagamento } from "../types/metodoPagamento";
import type { ReservaDetalhe } from "../types/reservaDetalhe";
import { formatarCodigoReserva, formatarContagem } from "../utils/formatarReserva";
import { ResumoReserva } from "./ResumoReserva";

const metodos: { valor: MetodoPagamento; icone: string; titulo: string }[] = [
  { valor: "PIX", icone: "❖", titulo: "PIX" },
  { valor: "CARTAO", icone: "💳", titulo: "Cartão de Crédito" },
];

// O quadro "pagamento" do Figma: forma de pagamento à esquerda e o resumo com o botão à direita.
// Usa o card e a grade da etapa de passageiros, que têm o mesmo visual no Figma.
// O checkout é fictício: o QR Code e a chave PIX não cobram nada e o cartão não pede dados.
// `pagamento` vem de EtapaPagamento, que mostra o resultado e não troca de tela no meio do envio.
export function FormularioPagamento({ reserva, agora, pagamento }: {
  reserva: ReservaDetalhe;
  agora: Date;
  pagamento: ReturnType<typeof usePagamento>;
}) {
  const { metodo, setMetodo, erro, pagar } = pagamento;
  const [copia, setCopia] = useState<"copiado" | "falhou" | null>(null);
  const codigoPix = `ROTAE-PIX-${formatarCodigoReserva(reserva).replace("#", "")}`;

  // Sem permissão ou fora de HTTPS o navegador não deixa copiar; o código continua no QR.
  async function copiarCodigo() {
    try {
      await navigator.clipboard.writeText(codigoPix);
      setCopia("copiado");
    } catch {
      setCopia("falhou");
    }
  }

  return (
    <div className="reserva-passageiros">
      <section className="reserva-passageiros-card" aria-labelledby="titulo-pagamento">
        <header>
          <h1 id="titulo-pagamento">Forma de pagamento</h1>
          <p>Checkout fictício para demonstração acadêmica.</p>
          <span className="reserva-pagamento-prazo">Reserva expira em {formatarContagem(reserva.expiraEm, agora)}</span>
        </header>
        <div className="reserva-pagamento-metodos">
          <div role="group" aria-label="Forma de pagamento">
            {metodos.map(({ valor, icone, titulo }) => (
              <button key={valor} type="button" aria-pressed={metodo === valor} onClick={() => setMetodo(valor)}>
                <span aria-hidden="true">{icone}</span> {titulo}
              </button>
            ))}
          </div>
          <p>Ambos os métodos estão disponíveis para demonstração, mas nenhum dado real será coletado.</p>
        </div>
        {metodo === "PIX" ? (
          <div className="reserva-pagamento-detalhe">
            <div>
              <strong>Escaneie o código ou copie a chave para pagar</strong>
              <p>O PIX é processado instantaneamente para garantir sua reserva.</p>
              <small>Este código é fictício e serve apenas para demonstração.</small>
            </div>
            <div className="reserva-pagamento-qr">
              <QRCodeSVG
                value={codigoPix}
                size={120}
                marginSize={1}
                level="M"
                fgColor="#123d33"
                bgColor="transparent"
                role="img"
                aria-label="QR Code PIX fictício"
              />
            </div>
            <Button className="viagem-selecionar" type="button" onClick={() => void copiarCodigo()}>
              {copia === "copiado" ? "Código copiado" : "Copiar código PIX"}
            </Button>
            {copia === "falhou" && <p role="alert">Não foi possível copiar. O código é {codigoPix}.</p>}
          </div>
        ) : (
          <div className="reserva-pagamento-detalhe">
            <div>
              <strong>Pagamento com cartão de crédito</strong>
              <p>Nenhum dado de cartão é pedido nem guardado nesta demonstração.</p>
              <small>Clique em &quot;Confirmar pagamento&quot; para simular a cobrança.</small>
            </div>
          </div>
        )}
      </section>
      <ResumoReserva reserva={reserva}>
        <Button className="viagem-selecionar" type="button" onClick={() => void pagar()}>
          Confirmar pagamento
        </Button>
        {erro && <p role="alert">{erro}</p>}
        <small>Clique no botão acima para simular o pagamento.</small>
      </ResumoReserva>
    </div>
  );
}
