import type { Cidade } from "@/modules/cidade/types/cidade";

export function formatarNomeCidade(cidade: Cidade) {
  return `${cidade.nome} (${cidade.uf})`;
}
