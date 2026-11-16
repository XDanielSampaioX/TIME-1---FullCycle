"use client";

import Link from "next/link";
import { useAutenticacao } from "@/modules/autenticacao/hooks/useAutenticacao";
import { Container } from "@/shared/components/Container";
import { EtapaConfirmacao } from "../components/EtapaConfirmacao";
import "@/modules/viagem/pages/viagens.css";
import "./reservas.css";

// No Figma, a tela de confirmação não tem a barra de etapas do checkout.
export function ConfirmacaoReservaPage({ reservaId }: { reservaId: number }) {
  const { estado } = useAutenticacao();

  return (
    <main className="viagem-page reserva-page">
      <Container className="reserva-confirmacao-pagina">
        {estado === "autenticado" && <EtapaConfirmacao key={reservaId} reservaId={reservaId} />}
        {estado === "anonimo" && (
          <div className="viagem-vazia">
            <p>Entre na sua conta para ver sua reserva.</p>
            <Link className="viagem-selecionar" href="/login">Entrar</Link>
          </div>
        )}
      </Container>
    </main>
  );
}
