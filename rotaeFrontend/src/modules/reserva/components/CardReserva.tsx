import type { Reserva } from "@/modules/reserva/types/reserva";

type CardReservaProps = {
  reserva: Reserva;
  onCancelar: (id: number) => void;
};

export function CardReserva({ reserva, onCancelar }: CardReservaProps) {
  const podeCancelar = reserva.id !== undefined && reserva.status !== "CANCELADO";

  return (
    <article className="reserva-card">
      <div>
        <strong>Reserva #{reserva.id}</strong>
        <span className="reserva-status">{reserva.status}</span>
      </div>
      <p>Usuário: {reserva.usuarioId}</p>
      <p>Viagem: {reserva.viagemId}</p>
      {reserva.valorTotal !== undefined && <p>Valor: {(reserva.valorTotal / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>}
      <p>Criada em: {new Date(reserva.criadoEm).toLocaleString("pt-BR")}</p>
      {reserva.expiraEm && <p>Expira em: {new Date(reserva.expiraEm).toLocaleString("pt-BR")}</p>}
      {podeCancelar && (
        <button type="button" onClick={() => onCancelar(reserva.id as number)}>
          Cancelar reserva
        </button>
      )}
    </article>
  );
}
