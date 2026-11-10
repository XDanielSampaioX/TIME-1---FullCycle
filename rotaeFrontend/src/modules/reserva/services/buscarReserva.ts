import { apiUrl } from "@/lib/api";
import { fetchAutenticado } from "@/modules/autenticacao/services/fetchAutenticado";
import type { ReservaDetalhe } from "../types/reservaDetalhe";

export async function buscarReserva(reservaId: number): Promise<ReservaDetalhe> {
  const resposta = await fetchAutenticado(apiUrl(`/api/v1/reservas/${reservaId}/`));

  if (!resposta.ok) throw new Error("Não foi possível carregar os detalhes da reserva.");
  return await resposta.json() as ReservaDetalhe;
}
