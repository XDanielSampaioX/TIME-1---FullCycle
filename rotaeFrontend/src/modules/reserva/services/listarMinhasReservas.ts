import { apiUrl } from "@/lib/api";
import { fetchAutenticado } from "@/modules/autenticacao/services/fetchAutenticado";
import type { Pagina } from "@/shared/types/pagina";
import type { Reserva } from "../types/reserva";

// O backend não filtra esta rota: os filtros e suas contagens precisam de todas as páginas.
export async function listarMinhasReservas(): Promise<Reserva[]> {
  const reservas: Reserva[] = [];
  let endereco: string | null = "/api/v1/me/reservas/";

  while (endereco) {
    const resposta = await fetchAutenticado(apiUrl(endereco));
    if (!resposta.ok) throw new Error("Não foi possível listar suas reservas.");

    const pagina: Pagina<Reserva> = await resposta.json();
    reservas.push(...pagina.results);
    endereco = pagina.next;
  }

  return reservas;
}
