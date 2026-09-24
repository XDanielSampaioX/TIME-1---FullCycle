import { apiUrl } from "@/lib/api";
import type { Reserva } from "@/modules/reserva/types/reserva";

export async function listarReservas(): Promise<Reserva[]> {
  const resposta = await fetch(apiUrl("/api/reservas"));

  if (!resposta.ok) throw new Error("Não foi possível listar as reservas.");
  return resposta.json() as Promise<Reserva[]>;
}
