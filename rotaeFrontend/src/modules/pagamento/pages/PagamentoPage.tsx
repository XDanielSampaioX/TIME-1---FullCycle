"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/shared/components/Button";
import { EtapasCheckout } from "@/modules/reserva/components/EtapasCheckout";
import { ResumoCheckout } from "@/modules/reserva/components/ResumoCheckout";
import { useSessaoCheckout } from "@/modules/reserva/hooks/useSessaoCheckout";
import { useViagem } from "@/modules/viagem/hooks/useViagem";
import type { MetodoPagamento, StatusPagamento } from "../types/pagamento";
import "@/modules/reserva/pages/checkout.css";

export function PagamentoPage({ viagemId }: { viagemId: number }) {
  const router = useRouter();
  const { sessao, carregando: carregandoSessao, atualizar } = useSessaoCheckout(viagemId);
  const { viagens, cidades, carregando, erro } = useViagem();
  const [metodo, setMetodo] = useState<MetodoPagamento>("PIX");
  const [segundos, setSegundos] = useState(14 * 60 + 58);

  useEffect(() => {
    const intervalo = window.setInterval(() => setSegundos((valor) => Math.max(0, valor - 1)), 1000);
    return () => window.clearInterval(intervalo);
  }, []);

  const viagem = viagens.find((item) => item.id === viagemId);
  const origem = cidades.find((item) => item.id === viagem?.origemId);
  const destino = cidades.find((item) => item.id === viagem?.destinoId);
  const resultado = viagem && origem && destino ? { viagem, origem, destino, assentosLivres: 0 } : null;
  const relogio = `${String(Math.floor(segundos / 60)).padStart(2, "0")}:${String(segundos % 60).padStart(2, "0")}`;

  function simular(status: StatusPagamento) {
    if (!sessao) return;
    const codigoReserva = `ROT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    atualizar({ ...sessao, metodoPagamento: metodo, statusPagamento: status, codigoReserva });

    if (status === "APROVADO") router.push(`/viagens/${viagemId}/confirmacao`);
  }

  if (carregando || carregandoSessao) return <main className="checkout-page"><p className="checkout-estado">Carregando pagamento…</p></main>;
  if (erro) return <main className="checkout-page"><p className="checkout-estado" role="alert">{erro}</p></main>;
  if (!sessao || sessao.passageiros.length !== sessao.assentoIds.length || !resultado) {
    return (
      <main className="checkout-page">
        <div className="checkout-estado">
          <h1>Dados do checkout incompletos</h1>
          <p>Informe os passageiros antes de escolher o pagamento.</p>
          <Link href={`/viagens/${viagemId}/passageiros`}>Voltar aos passageiros</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <EtapasCheckout atual={3} />
      <div className="checkout-layout">
        <section className="checkout-card">
          <header className="pagamento-cabecalho">
            <div>
              <h1>Forma de pagamento</h1>
              <p>Checkout fictício para demonstração acadêmica.</p>
            </div>
            <strong className="pagamento-tempo">Reserva expira em {relogio}</strong>
          </header>
          <div className="pagamento-metodos" role="tablist" aria-label="Forma de pagamento">
            <button type="button" role="tab" aria-selected={metodo === "PIX"} onClick={() => setMetodo("PIX")}>❖ PIX</button>
            <button type="button" role="tab" aria-selected={metodo === "CARTAO"} onClick={() => setMetodo("CARTAO")}>▣ Cartão</button>
          </div>
          {metodo === "PIX" ? (
            <div className="pagamento-pix">
              <Image src="/checkout/qr-code.svg" width={184} height={184} alt="QR Code demonstrativo para pagamento via PIX" />
              <div>
                <h2>Escaneie o QR Code</h2>
                <p>Use o aplicativo do seu banco para ler o código. O PIX é processado instantaneamente para garantir sua reserva.</p>
                <button type="button" onClick={() => navigator.clipboard?.writeText("PIX-DEMONSTRACAO-ROTAE")}>Copiar código PIX</button>
              </div>
            </div>
          ) : (
            <div className="pagamento-cartao">
              <label className="checkout-campo checkout-campo-largo">Número do cartão<input inputMode="numeric" placeholder="0000 0000 0000 0000" /></label>
              <label className="checkout-campo checkout-campo-largo">Nome impresso no cartão<input placeholder="Como aparece no cartão" /></label>
              <label className="checkout-campo">Validade<input inputMode="numeric" placeholder="MM/AA" /></label>
              <label className="checkout-campo">CVV<input inputMode="numeric" placeholder="000" /></label>
            </div>
          )}
          {sessao.statusPagamento === "NEGADO" && <p className="pagamento-erro" role="alert">Pagamento não aprovado. Nenhuma cobrança foi registrada; tente novamente com outro método.</p>}
          <div className="checkout-acoes pagamento-acoes">
            <Link href={`/viagens/${viagemId}/passageiros`}>← Voltar</Link>
            <div>
              <Button type="button" variant="ghost" onClick={() => simular("NEGADO")}>Simular falha</Button>
              <Button type="button" onClick={() => simular("APROVADO")}>Confirmar pagamento →</Button>
            </div>
          </div>
        </section>
        <ResumoCheckout sessao={sessao} resultado={resultado} />
      </div>
      <p className="pagamento-aviso"><strong>Ambiente de demonstração.</strong> Use os botões para simular os resultados sem sair da tela. Não há integração real com pagamentos.</p>
    </main>
  );
}
