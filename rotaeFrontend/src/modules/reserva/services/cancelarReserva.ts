import { apiUrl } from "@/lib/api";
import { fetchAutenticado } from "@/modules/autenticacao/services/fetchAutenticado";
import type { Reserva } from "../types/reserva";

// keepalive deixa a requisição terminar mesmo se a página estiver sendo fechada.
export async function cancelarReserva(reservaId: number, opcoes?: Pick<RequestInit, "keepalive">): Promise<Reserva> {
  const resposta = await fetchAutenticado(apiUrl(`/api/v1/reservas/${reservaId}/cancelar/`), {
    method: "POST",
    ...opcoes,
  });

  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => null) as { detail?: string } | null;
    throw new Error(corpo?.detail ?? "Não foi possível cancelar a reserva.");
  }

  return await resposta.json() as Reserva;
}
