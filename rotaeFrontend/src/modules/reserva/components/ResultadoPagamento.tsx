import Link from "next/link";
import { Button } from "@/shared/components/Button";
import type { ReservaDetalhe } from "../types/reservaDetalhe";
import { BilheteReserva } from "./BilheteReserva";

// Os quadros "pagamento-pendente" e "pagamento-negado" do Figma: título, bilhete sem QR Code e ações.
// processando: o backend ainda não respondeu. negado: tentativa recusada ou provedor indisponível.
// reservaFalhou: foi a terceira recusa, o backend marcou a reserva como FALHA e liberou as poltronas.
export function ResultadoPagamento({ reserva, negado, reservaFalhou, aoTentarNovamente }: {
  reserva: ReservaDetalhe;
  negado: boolean;
  reservaFalhou: boolean;
  aoTentarNovamente: () => void;
}) {
  if (!negado) {
    return (
      <div className="reserva-pagamento-resultado">
        {/* Só o cabeçalho é anunciado pelo leitor de tela; o bilhete já estava na página. */}
        <header className="reserva-modal-titulo" data-status="PAGAMENTO_PENDENTE" role="status">
          <span aria-hidden="true">…</span>
          <h1>Pagamento em processamento</h1>
          <p>Aguarde a resposta do pagamento. Não feche esta página.</p>
        </header>
        <BilheteReserva reserva={reserva} />
      </div>
    );
  }

  return (
    <div className="reserva-pagamento-resultado">
      {/* No Figma o ícone da recusa usa o verde da marca; a reserva encerrada usa o vermelho de FALHA. */}
      <header className="reserva-modal-titulo" data-status={reservaFalhou ? "FALHA" : "RECUSADO"} role="status">
        <span aria-hidden="true">!</span>
        <h1>Pagamento não aprovado</h1>
        <p>
          {reservaFalhou
            ? "A reserva foi encerrada depois de 3 tentativas recusadas e as poltronas foram liberadas."
            : "Não foi registrada nenhuma cobrança. Seus assentos continuam disponíveis por pouco tempo."}
        </p>
      </header>
      <BilheteReserva reserva={reserva} />
      <div className="reserva-pagamento-aviso">
        <strong>Nenhuma cobrança foi registrada</strong>
        <p>
          {reservaFalhou
            ? "Escolha as poltronas de novo para fazer uma nova reserva."
            : "Você pode tentar novamente com outra forma de pagamento ou voltar às suas viagens."}
        </p>
      </div>
      <div className="reserva-modal-acoes">
        {reservaFalhou
          ? <Link className="shared-button shared-button-secondary" href={`/viagens/${reserva.viagem.id}/assentos`}>Escolher poltronas</Link>
          : <Button variant="secondary" type="button" onClick={aoTentarNovamente}>Tentar novamente</Button>}
        <Link className="shared-button shared-button-ghost" href="/minhas-viagens">Voltar às minhas viagens</Link>
      </div>
    </div>
  );
}
