import { apiUrl } from "@/lib/api";
import type { Reserva } from "@/modules/reserva/types/reserva";

export async function cancelarReserva(id: number): Promise<Reserva> {
  const resposta = await fetch(apiUrl(`/api/reservas/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "CANCELADO" }),
  });

  if (!resposta.ok) throw new Error("Não foi possível cancelar a reserva.");
  return resposta.json() as Promise<Reserva>;
}
