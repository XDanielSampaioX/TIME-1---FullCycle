"use client";

import { useEffect, useState } from "react";
import type { Cidade } from "@/modules/cidade/types/cidade";
import { OrdenacaoMenorPreco } from "../classes/OrdenacaoMenorPreco";
import { OrdenacaoMenorDuracao } from "../classes/OrdenacaoMenorDuracao";
import { OrdenacaoSaidaMaisCedo } from "../classes/OrdenacaoSaidaMaisCedo";
import type { OrdenacaoViagem } from "../classes/OrdenacaoViagem";
import type { FiltrosViagem } from "../types/filtrosViagem";
import type { ViagemDisponivel } from "../types/viagemDisponivel";
import type { BuscaViagem } from "../types/buscaViagem";

// Teto fixo (R$ 1.000,00): derivá-lo das viagens filtradas impedia subir o slider depois de baixá-lo.
const LIMITE_PRECO_CENTAVOS = 100000;

const ordenacoes: OrdenacaoViagem[] = [
  new OrdenacaoMenorPreco(),
  new OrdenacaoMenorDuracao(),
  new OrdenacaoSaidaMaisCedo(),
];

export function useFiltrosViagem(
  viagens: ViagemDisponivel[],
  busca: BuscaViagem,
  cidades: Cidade[],
  cidadesCarregadas: boolean,
  consultarViagens: (parametros: URLSearchParams) => void,
) {
  const [filtros, setFiltros] = useState<FiltrosViagem>({
    periodos: [],
    classes: [],
    precoMinimo: 0,
    precoMaximo: Infinity,
  });
  const [ordenacaoId, setOrdenacaoId] = useState(ordenacoes[0].id);
  const ordenacao = ordenacoes.find((item) => item.id === ordenacaoId) ?? ordenacoes[0];
  const resultados = viagens;

  useEffect(() => {
    if (!cidadesCarregadas) return;

    const parametros = new URLSearchParams();
    const cidadeId = (valor: string) => {
      if (!valor) return "";
      const cidadePorId = cidades.find((item) => String(item.id) === valor);
      if (cidadePorId) return String(cidadePorId.id);

      const termoNormalizado = valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase("pt-BR");
      const cidade = cidades.find((item) => `${item.nome} (${item.uf})`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase("pt-BR")
        .includes(termoNormalizado));
      return cidade ? String(cidade.id) : "-1";
    };

    if (busca.origem) parametros.set("origem", cidadeId(busca.origem));
    if (busca.destino) parametros.set("destino", cidadeId(busca.destino));
    if (busca.partida) parametros.set("data", busca.partida);
    if (busca.passageiros !== undefined) parametros.set("passageiros", String(busca.passageiros));

    filtros.classes.forEach((classe) => parametros.append("classe", classe));
    filtros.periodos.forEach((periodo) => parametros.append("periodo", String(periodo)));
    
    if (filtros.precoMinimo > 0) parametros.set("precoMin", String(filtros.precoMinimo));
    if (Number.isFinite(filtros.precoMaximo)) parametros.set("precoMax", String(filtros.precoMaximo));
    parametros.set("ordering", ordenacao.parametroApi);

    const timeout = setTimeout(() => consultarViagens(parametros), 250);
    return () => clearTimeout(timeout);
  }, [busca, cidades, cidadesCarregadas, consultarViagens, filtros, ordenacao]);

  function limpar() {
    setFiltros({ periodos: [], classes: [], precoMinimo: 0, precoMaximo: Infinity });
  }

  return { filtros, setFiltros, resultados, limitePreco: LIMITE_PRECO_CENTAVOS, ordenacoes, ordenacaoId, setOrdenacaoId, limpar };
}
