"use client";

import Link from "next/link";
import { useAutenticacao } from "@/modules/autenticacao/hooks/useAutenticacao";
import { Container } from "@/shared/components/Container";
import { EtapasCheckout } from "@/shared/components/EtapasCheckout";
import { EtapaPagamento } from "../components/EtapaPagamento";
import "@/modules/viagem/pages/viagens.css";
import "@/modules/viagem-assento/pages/assentos.css";
import "./reservas.css";

export function PagamentoReservaPage({ reservaId }: { reservaId: number }) {
  const { estado } = useAutenticacao();

  return (
    <main className="viagem-page reserva-page">
      <EtapasCheckout atual={3} />
      <Container className="reserva-etapa-passageiros">
        {estado === "autenticado" && <EtapaPagamento key={reservaId} reservaId={reservaId} />}
        {estado === "anonimo" && (
          <div className="viagem-vazia">
            <p>Entre na sua conta para pagar a reserva.</p>
            <Link className="viagem-selecionar" href="/login">Entrar</Link>
          </div>
        )}
      </Container>
    </main>
  );
}
