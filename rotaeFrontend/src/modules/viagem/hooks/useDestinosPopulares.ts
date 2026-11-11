"use client";

import { useEffect, useState } from "react";
import { listarViagens } from "../services/listarViagens";
import type { Viagem } from "../types/viagem";
import type { Pagina } from "@/shared/types/pagina";

const TOTAL_DESTINOS = 4;

// A API devolve da mais barata para a mais cara, então a primeira viagem de cada destino é a mais barata dele.
// Lê as páginas só até achar os destinos necessários ou acabar a lista.
async function buscarDestinosMaisBaratos() {
  const destinos: Viagem[] = [];
  let url: string | null = "/api/v1/viagens/?ordering=preco";

  while (url && destinos.length < TOTAL_DESTINOS) {
    const pagina: Pagina<Viagem> = await listarViagens(url);

    for (const viagem of pagina.results) {
      if (!destinos.some((destino) => destino.destino.id === viagem.destino.id)) destinos.push(viagem);
    }

    url = pagina.next;
  }

  return destinos.slice(0, TOTAL_DESTINOS);
}

export function useDestinosPopulares() {
  const [destinos, setDestinos] = useState<Viagem[]>([]);

  useEffect(() => {
    let ativo = true;

    buscarDestinosMaisBaratos()
      .then((maisBaratos) => {
        if (ativo) setDestinos(maisBaratos);
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
