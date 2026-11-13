import Link from "next/link";
import { Button } from "@/shared/components/Button";
import type { ReservaDetalhe } from "../types/reservaDetalhe";
import { bilheteEmitido, descreverStatusReserva } from "../utils/regrasReserva";
import { BilheteReserva } from "./BilheteReserva";

// O quadro "confirmacao" do Figma: título, bilhete e ações. Aparece depois dos passageiros
// e também no modal de detalhes de "Minhas viagens", para as duas telas mostrarem o mesmo bilhete.
export function ConfirmacaoReserva({ reserva, agora, dentroDoModal }: {
  reserva: ReservaDetalhe;
  agora: Date;
  dentroDoModal: boolean;
}) {
  const { statusAtual, titulo, descricao } = descreverStatusReserva(reserva, agora);
  const emitido = bilheteEmitido(reserva, agora);
  const Titulo = dentroDoModal ? "h2" : "h1";
  const voltarAoInicio = <Link className="shared-button shared-button-ghost" href="/">Voltar ao início</Link>;

  return (
    <>
      {/* O bilhete emitido usa as cores de PAGO mesmo enquanto o pagamento é pulado. */}
      <header className="reserva-modal-titulo" data-status={emitido ? "PAGO" : statusAtual}>
        <span aria-hidden="true">{emitido ? "✓" : "!"}</span>
        <Titulo>{emitido ? "Reserva confirmada!" : titulo}</Titulo>
        <p>{emitido ? "Seu bilhete digital está pronto para embarque." : descricao}</p>
      </header>
      <BilheteReserva reserva={reserva} emitido={emitido} />
      {dentroDoModal ? (
        // O method="dialog" faz o botão fechar o modal, que já está em "Minhas viagens".
        <form className="reserva-modal-acoes" method="dialog">
          <Button variant="secondary">Ver minhas viagens</Button>
          {voltarAoInicio}
        </form>
      ) : (
        <div className="reserva-modal-acoes">
          <Link className="shared-button shared-button-secondary" href="/minhas-viagens">Ver minhas viagens</Link>
          {voltarAoInicio}
        </div>
      )}
    </>
  );
}
