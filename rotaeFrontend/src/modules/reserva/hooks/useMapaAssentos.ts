"use client";

import { useEffect } from "react";
import { useCarregarDados } from "./useCarregarDados";
import { listarViagensAssentos } from "@/modules/viagem-assento/services/listarViagensAssentos";

const INTERVALO_DE_CONSULTA_MS = 5000;

// O backend não envia eventos em tempo real: consultar o mapa em intervalos curtos é o que
// faz uma poltrona segurada por outra pessoa aparecer como ocupada nas outras telas.
export function useMapaAssentos(viagemId: number) {
  const { dados, erro, carregando, recarregar } = useCarregarDados(
    listarViagensAssentos,
    viagemId,
    "Não foi possível carregar os assentos desta viagem.",
  );

  // A próxima consulta só é agendada depois da resposta da anterior e fica parada com a aba oculta.
  useEffect(() => {
    if (carregando) return;

    const espera = setTimeout(() => {
      if (!document.hidden) recarregar();
    }, INTERVALO_DE_CONSULTA_MS);

    return () => clearTimeout(espera);
  }, [carregando, recarregar]);

  useEffect(() => {
    function aoMudarVisibilidade() {
      if (!document.hidden) recarregar();
    }

    document.addEventListener("visibilitychange", aoMudarVisibilidade);
    return () => document.removeEventListener("visibilitychange", aoMudarVisibilidade);
  }, [recarregar]);

  return {
    // Uma falha passageira mantém o último mapa na tela; só a primeira carga mostra o erro.
    assentos: dados ?? [],
    carregando: !dados && carregando,
    erro: dados ? null : erro,
    atualizar: recarregar,
  };
}
