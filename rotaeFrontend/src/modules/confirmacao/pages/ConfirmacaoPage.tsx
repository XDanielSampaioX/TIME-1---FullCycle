"use client";

import Image from "next/image";
import Link from "next/link";
import { useSessaoCheckout } from "@/modules/reserva/hooks/useSessaoCheckout";
import { useViagem } from "@/modules/viagem/hooks/useViagem";
import { formatarValorEmReais } from "@/shared/utils/formatarValorEmReais";
import "@/modules/reserva/pages/checkout.css";

export function ConfirmacaoPage({ viagemId }: { viagemId: number }) {
  const { sessao, carregando: carregandoSessao } = useSessaoCheckout(viagemId);
  const { viagens, cidades, carregando, erro } = useViagem();
  const viagem = viagens.find((item) => item.id === viagemId);
  const origem = cidades.find((item) => item.id === viagem?.origemId);
  const destino = cidades.find((item) => item.id === viagem?.destinoId);

  if (carregando || carregandoSessao) return <main className="checkout-page"><p className="checkout-estado">Emitindo bilhetes…</p></main>;
  if (erro) return <main className="checkout-page"><p className="checkout-estado" role="alert">{erro}</p></main>;
  if (!sessao || sessao.statusPagamento !== "APROVADO" || !viagem || !origem || !destino) {
    return (
      <main className="checkout-page">
        <div className="checkout-estado">
          <h1>Confirmação indisponível</h1>
          <p>Conclua o pagamento demonstrativo para emitir os bilhetes.</p>
          <Link href={`/viagens/${viagemId}/pagamento`}>Ir para pagamento</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page confirmacao-page">
      <header className="confirmacao-sucesso">
        <span aria-hidden="true">✓</span>
        <h1>Reserva confirmada!</h1>
        <p>Seus bilhetes digitais estão prontos para embarque.</p>
      </header>
      <div className="confirmacao-bilhetes">
        {sessao.passageiros.map((passageiro, indice) => (
          <article className="confirmacao-bilhete" key={`${passageiro.cpf}-${sessao.assentoIds[indice]}`}>
            <header>
              <strong>BILHETE DIGITAL EMITIDO</strong>
              <span>#{sessao.codigoReserva}-{indice + 1}</span>
            </header>
            <div className="confirmacao-corpo">
              <div className="confirmacao-rota">
                <div><small>ORIGEM</small><strong>{origem.nome}</strong><span>{viagem.partidaEm.slice(8, 10)} • {viagem.partidaEm.slice(11, 16)}</span></div>
                <b aria-hidden="true">➔</b>
                <div><small>DESTINO</small><strong>{destino.nome}</strong><span>{viagem.chegadaEm.slice(8, 10)} • {viagem.chegadaEm.slice(11, 16)}</span></div>
              </div>
              <dl className="confirmacao-detalhes">
                <div><dt>PASSAGEIRO</dt><dd>{passageiro.nome}</dd></div>
                <div><dt>CLASSE</dt><dd>{viagem.classe?.toLowerCase().replace("_", "-") ?? "Convencional"}</dd></div>
                <div><dt>POLTRONA</dt><dd>{sessao.numerosAssentos[indice]}</dd></div>
                <div><dt>VALOR PAGO</dt><dd>{formatarValorEmReais(viagem.precoCentavos)}</dd></div>
              </dl>
              <div className="confirmacao-embarque">
                <Image src="/checkout/bilhete.svg" width={64} height={64} alt="" />
                <p><strong>Apresente este bilhete no embarque</strong><span>Chegue com 30 minutos de antecedência e leve um documento com foto.</span></p>
              </div>
            </div>
          </article>
        ))}
      </div>
      <nav className="confirmacao-acoes" aria-label="Ações da reserva">
        <Link className="shared-button shared-button-secondary" href="/reservas">Ver minhas viagens</Link>
        <Link className="shared-button shared-button-primary" href="/">Encontrar nova viagem</Link>
      </nav>
    </main>
  );
}
