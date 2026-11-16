"use client";

import { useCallback, useEffect, useState } from "react";

// Busca dados quando a tela abre e informa se está carregando ou se deu erro.
// `recarregar` busca de novo; enquanto isso, os dados anteriores continuam disponíveis.
// `buscar` precisa ser uma função fixa, como um serviço, e não uma criada dentro do componente.
export function useCarregarDados<Parametro, Dados>(
  buscar: (parametro: Parametro) => Promise<Dados>,
  parametro: Parametro,
  mensagemDeErro: string,
) {
  const [tentativa, setTentativa] = useState(0);
  const [estado, setEstado] = useState<{ dados: Dados | null; erro: string | null; carregando: boolean }>({
    dados: null,
    erro: null,
    carregando: true,
  });

  useEffect(() => {
    // Se uma busca mais nova começar, a resposta desta é ignorada.
    let ignorarResposta = false;

    buscar(parametro)
      .then((dados) => {
        if (!ignorarResposta) setEstado({ dados, erro: null, carregando: false });
      })
      .catch(() => {
        if (!ignorarResposta) setEstado((atual) => ({ dados: atual.dados, erro: mensagemDeErro, carregando: false }));
      });

    return () => {
      ignorarResposta = true;
    };
  }, [buscar, parametro, mensagemDeErro, tentativa]);

  const recarregar = useCallback(() => {
    setEstado((atual) => ({ ...atual, erro: null, carregando: true }));
    setTentativa((atual) => atual + 1);
  }, []);

  return { ...estado, recarregar };
}
