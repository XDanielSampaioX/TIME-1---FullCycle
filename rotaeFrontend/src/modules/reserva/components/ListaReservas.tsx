"use client";

import { useReserva } from "@/modules/reserva/contexts/ReservaContext";
import { CardReserva } from "@/modules/reserva/components/CardReserva";

export function ListaReservas() {
  const { reservas, carregando, erro, cancelar } = useReserva();

  if (carregando) return <p role="status">Carregando reservas...</p>;
  if (erro) return <p role="alert">{erro}</p>;
  if (reservas.length === 0) return <p>Nenhuma reserva encontrada.</p>;

  return (
    <div className="reserva-lista">
      {reservas.map((reserva) => (
        <CardReserva
          key={reserva.id}
          reserva={reserva}
          onCancelar={(id) => void cancelar(id)}
        />
      ))}
    </div>
  );
}
