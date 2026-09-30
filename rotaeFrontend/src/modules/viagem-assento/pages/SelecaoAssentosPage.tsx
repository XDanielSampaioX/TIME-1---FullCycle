"use client";

import Link from "next/link";
import { ViagemProvider } from "@/modules/viagem/contexts/ViagemContext";
import type { BuscaViagem } from "@/modules/viagem/types/buscaViagem";
import { ConteudoSelecaoAssentos } from "../components/ConteudoSelecaoAssentos";
import { EtapasCheckout } from "@/modules/reserva/components/EtapasCheckout";
import "@/modules/viagem/pages/viagens.css";
import "./assentos.css";

export function SelecaoAssentosPage({ viagemId, busca }: { viagemId: number; busca: BuscaViagem }) {
  const parametros = new URLSearchParams({ ...busca, passageiros: String(busca.passageiros) });

  return (
    <ViagemProvider>
      <main className="viagem-page assento-page">
        <EtapasCheckout atual={1} />
        <Link className="assento-voltar" href={`/viagens?${parametros}`}>← Voltar aos resultados</Link>
        <ConteudoSelecaoAssentos key={`${viagemId}-${busca.passageiros}`} viagemId={viagemId} busca={busca} />
      </main>
    </ViagemProvider>
  );
}
