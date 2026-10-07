import type { BuscaViagem } from "../types/buscaViagem";

export function obterBuscaViagem(parametros: Record<string, string | string[] | undefined>): BuscaViagem {
  const texto = (nome: string) => typeof parametros[nome] === "string" ? parametros[nome].trim() : "";
  const valorQuantidade = texto("passageiros");
  const quantidade = Number(valorQuantidade);

  return {
    origem: texto("origem"),
    destino: texto("destino"),
    partida: texto("partida"),
    passageiros: valorQuantidade && Number.isInteger(quantidade) && quantidade >= 1 && quantidade <= 4
      ? quantidade
      : undefined,
  };
}
