"use client";

import Link from "next/link";
import type { BuscaViagem } from "@/modules/viagem/types/buscaViagem";
import { EtapasCheckout } from "@/shared/components/EtapasCheckout";
import { SelecaoAssentos } from "../components/SelecaoAssentos";
import "@/modules/viagem/pages/viagens.css";
import "@/modules/viagem-assento/pages/assentos.css";
import "./reservas.css";

export function SelecaoAssentosPage({ viagemId, busca }: { viagemId: number; busca: BuscaViagem }) {
  const parametros = new URLSearchParams({
    origem: busca.origem,
    destino: busca.destino,
    partida: busca.partida,
  });

  if (busca.passageiros !== undefined) parametros.set("passageiros", String(busca.passageiros));

  return (
    <main className="viagem-page reserva-page">
      <EtapasCheckout atual={1} />
      <Link className="assento-voltar" href={`/viagens?${parametros}`}>← Voltar aos resultados</Link>
      <SelecaoAssentos key={viagemId} viagemId={viagemId} busca={busca} />
    </main>
  );
}
