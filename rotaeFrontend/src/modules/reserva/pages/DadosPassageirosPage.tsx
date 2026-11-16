"use client";

import Link from "next/link";
import { useAutenticacao } from "@/modules/autenticacao/hooks/useAutenticacao";
import { Container } from "@/shared/components/Container";
import { EtapasCheckout } from "@/shared/components/EtapasCheckout";
import { EtapaPassageiros } from "../components/EtapaPassageiros";
import "@/modules/viagem/pages/viagens.css";
import "@/modules/viagem-assento/pages/assentos.css";
import "./reservas.css";

export function DadosPassageirosPage({ reservaId }: { reservaId: number }) {
  const { estado } = useAutenticacao();

  return (
    <main className="viagem-page reserva-page">
      <EtapasCheckout atual={2} />
      <Container className="reserva-etapa-passageiros">
        {estado === "autenticado" && <EtapaPassageiros key={reservaId} reservaId={reservaId} />}
        {estado === "anonimo" && (
          <div className="viagem-vazia">
            <p>Entre na sua conta para informar os passageiros.</p>
            <Link className="viagem-selecionar" href="/login">Entrar</Link>
          </div>
        )}
      </Container>
    </main>
  );
}
