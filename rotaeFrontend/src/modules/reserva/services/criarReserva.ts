import { apiUrl } from "@/lib/api";
import type { Reserva } from "@/modules/reserva/types/reserva";

export async function criarReserva(dados: Reserva): Promise<Reserva> {
  const resposta = await fetch(apiUrl("/api/reservas"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  if (!resposta.ok) throw new Error("Não foi possível criar a reserva.");
  return resposta.json() as Promise<Reserva>;
}
