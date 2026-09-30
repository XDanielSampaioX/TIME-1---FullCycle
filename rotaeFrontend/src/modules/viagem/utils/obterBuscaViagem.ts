import type { BuscaViagem } from "../types/buscaViagem";

export function obterBuscaViagem(parametros: Record<string, string | string[] | undefined>): BuscaViagem {
  const texto = (nome: string) => typeof parametros[nome] === "string" ? parametros[nome].trim() : "";
  const quantidade = Number(texto("passageiros"));

  return {
    origem: texto("origem"),
    destino: texto("destino"),
    partida: texto("partida"),
    passageiros: Number.isInteger(quantidade) && quantidade >= 1 && quantidade <= 4 ? quantidade : 1,
  };
}
