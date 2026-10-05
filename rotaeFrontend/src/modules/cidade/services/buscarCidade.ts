import type { Cidade } from "@/modules/cidade/types/cidade";
import { listarCidades } from "@/modules/cidade/services/listarCidades";

export async function buscarCidade(id: number): Promise<Cidade> {
  const cidades = await listarCidades();
  const cidade = cidades.find((item) => item.id === id);

  if (!cidade) throw new Error("Não foi possível buscar a cidade.");
  return cidade;
}
