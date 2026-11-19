import { apiUrl } from "@/lib/api";
import { fetchAutenticado } from "@/modules/autenticacao/services/fetchAutenticado";
import type { Passagem } from "../types/passagem";

export async function buscarPassagem(passagemId: number): Promise<Passagem> {
  const resposta = await fetchAutenticado(apiUrl(`/api/v1/passagens/${passagemId}/`));

  if (!resposta.ok) throw new Error("Não foi possível carregar a passagem.");
  return await resposta.json() as Passagem;
}
