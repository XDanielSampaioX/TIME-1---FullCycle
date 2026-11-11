"use client";

import { useEffect, useState } from "react";
import { listarViagens } from "../services/listarViagens";
import type { Viagem } from "../types/viagem";

export function useDestinosPopulares() {
  const [destinos, setDestinos] = useState<Viagem[]>([]);

  useEffect(() => {
    let ativo = true;

    // A API devolve da mais barata para a mais cara, então a primeira viagem de cada destino é a mais barata dele.
    listarViagens("/api/v1/viagens/?ordering=preco")
      .then(({ results }) => {
        if (!ativo) return;

        const maisBaratas = results.filter((viagem, indice) =>
          results.findIndex((outra) => outra.destino.id === viagem.destino.id) === indice);

        setDestinos(maisBaratas.slice(0, 4));
      })
      .catch(() => {
        // Sem viagens a seção fica vazia, como já acontece hoje.
      });

    return () => {
      ativo = false;
    };
  }, []);

  return destinos;
}
