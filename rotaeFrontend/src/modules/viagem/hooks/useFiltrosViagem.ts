"use client";

import { useState } from "react";
import { OrdenacaoMenorPreco } from "../classes/OrdenacaoMenorPreco";
import { OrdenacaoMenorDuracao } from "../classes/OrdenacaoMenorDuracao";
import { OrdenacaoSaidaMaisCedo } from "../classes/OrdenacaoSaidaMaisCedo";
import type { OrdenacaoViagem } from "../classes/OrdenacaoViagem";
import type { FiltrosViagem } from "../types/filtrosViagem";
import type { ViagemDisponivel } from "../types/viagemDisponivel";

const ordenacoes: OrdenacaoViagem[] = [
  new OrdenacaoMenorPreco(),
  new OrdenacaoMenorDuracao(),
  new OrdenacaoSaidaMaisCedo(),
];

export function useFiltrosViagem(viagens: ViagemDisponivel[]) {
  const [filtros, setFiltros] = useState<FiltrosViagem>({
    periodos: [],
    classes: [],
    precoMinimo: 0,
    precoMaximo: Infinity,
  });
  const [ordenacaoId, setOrdenacaoId] = useState(ordenacoes[0].id);
  const ordenacao = ordenacoes.find((item) => item.id === ordenacaoId) ?? ordenacoes[0];
  const limitePreco = Math.max(100, ...viagens.map((item) => item.viagem.precoCentavos));
  const resultados = viagens.filter(({ viagem }) => {
    const hora = Number(viagem.partidaEm.slice(11, 13));
    return (!filtros.periodos.length || filtros.periodos.includes(Math.floor(hora / 6)))
      && (!filtros.classes.length || (viagem.classe && filtros.classes.includes(viagem.classe)))
      && viagem.precoCentavos >= filtros.precoMinimo && viagem.precoCentavos <= filtros.precoMaximo;
  }).sort((a, b) => ordenacao.comparar(a, b) || (a.viagem.id ?? 0) - (b.viagem.id ?? 0));
  const menorPreco = resultados.length ? Math.min(...resultados.map((item) => item.viagem.precoCentavos)) : undefined;

  function limpar() {
    setFiltros({ periodos: [], classes: [], precoMinimo: 0, precoMaximo: Infinity });
  }

  return { filtros, setFiltros, resultados, menorPreco, limitePreco, ordenacoes, ordenacaoId, setOrdenacaoId, limpar };
}
