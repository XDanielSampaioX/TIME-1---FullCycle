import Link from "next/link";
import type { ReservaDetalhe } from "../types/reservaDetalhe";
import { bilheteEmitido, descreverStatusReserva } from "../utils/regrasReserva";
import { BilheteReserva } from "./BilheteReserva";
import { CarrosselPassagens } from "@/modules/passagem/components/CarrosselPassagens";

// O quadro "confirmacao" do Figma: título, bilhete e ações. Aparece depois do pagamento
// e também no modal de detalhes de "Minhas viagens", para as duas telas mostrarem o mesmo bilhete.
export function ConfirmacaoReserva({ reserva, agora, dentroDoModal }: {
  reserva: ReservaDetalhe;
  agora: Date;
  dentroDoModal: boolean;
}) {
  const { statusAtual, titulo, descricao } = descreverStatusReserva(reserva, agora);
  const emitido = bilheteEmitido(reserva, agora);
  const Titulo = dentroDoModal ? "h2" : "h1";

  return (
    <>
      {/* O bilhete emitido usa as cores de PAGO. */}
      <header className="reserva-modal-titulo" data-status={emitido ? "PAGO" : statusAtual}>
        <span aria-hidden="true">{emitido ? "✓" : "!"}</span>
        <Titulo>{emitido ? "Reserva confirmada!" : titulo}</Titulo>
        <p>{emitido ? "Seu bilhete digital está pronto para embarque." : descricao}</p>
      </header>
      {emitido ? <CarrosselPassagens passagens={reserva.passagens} /> : <BilheteReserva reserva={reserva} />}
      {dentroDoModal ? (
        // Atrás do modal já está "Minhas viagens": basta fechar. O method="dialog" faz o botão fechar o modal.
        <form className="reserva-modal-fechar" method="dialog">
          <button type="submit" aria-label="Fechar">✕</button>
        </form>
      ) : (
        <div className="reserva-modal-acoes">
          {/* Aberta com a reserva ainda pendente (favorito, Voltar), a página leva ao pagamento. */}
          {statusAtual === "PAGAMENTO_PENDENTE" && reserva.passageiros.length > 0 && (
            <Link className="shared-button shared-button-secondary" href={`/reservas/${reserva.id}/pagamento`}>Ir para o pagamento</Link>
          )}
          {/* Em FALHA o backend liberou as poltronas: o caminho é reservar de novo. */}
          {statusAtual === "FALHA" && (
            <Link className="shared-button shared-button-secondary" href={`/viagens/${reserva.viagem.id}/assentos`}>Escolher poltronas</Link>
          )}
          <Link className="shared-button shared-button-secondary" href="/minhas-viagens">Ver minhas viagens</Link>
          <Link className="shared-button shared-button-ghost" href="/">Voltar ao início</Link>
        </div>
      )}
    </>
  );
}
