import { apiUrl } from "@/lib/api";
import { fetchAutenticado } from "@/modules/autenticacao/services/fetchAutenticado";
import type { Reserva } from "../types/reserva";

// Devolve a reserva criada ou, se alguma poltrona já foi tomada, a lista das que estão ocupadas.
export async function criarReserva(viagemId: number, viagemAssentoIds: number[]): Promise<Reserva | number[]> {
  const resposta = await fetchAutenticado(apiUrl("/api/v1/reservas/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ viagemId, viagemAssentoIds }),
  });

  // 409: o backend desfaz a reserva inteira e informa quais assentos já estavam ocupados.
  if (resposta.status === 409) {
    const corpo = await resposta.json() as { detail: string; assentos: number[] };
    if (!corpo.assentos.length) throw new Error(corpo.detail);
    return corpo.assentos;
  }

  if (!resposta.ok) throw new Error("Não foi possível reservar as poltronas.");
  return await resposta.json() as Reserva;
}
