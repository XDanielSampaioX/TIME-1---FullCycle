import { apiUrl } from "@/lib/api";
import type { Viagem } from "../types/viagem";

export async function buscarViagem(viagemId: number): Promise<Viagem | null> {
  const resposta = await fetch(apiUrl(`/api/v1/viagens/${viagemId}/`));

  if (resposta.status === 404) return null;
  if (!resposta.ok) throw new Error("Não foi possível carregar os dados da viagem.");
  
  return resposta.json() as Promise<Viagem>;
}
