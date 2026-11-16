"use client";

import Link from "next/link";
import { useAutenticacao } from "@/modules/autenticacao/hooks/useAutenticacao";
import { Container } from "@/shared/components/Container";
import { ConteudoMinhasViagens } from "../components/ConteudoMinhasViagens";
import "@/modules/viagem/pages/viagens.css";
import "./reservas.css";

export function MinhasViagensPage() {
  const { estado } = useAutenticacao();

  return (
    <main className="viagem-page reserva-page">
      <Container className="reserva-conteudo">
        <header className="reserva-introducao">
          <div>
            <h1>Minhas viagens</h1>
            <p>Acompanhe suas reservas, pagamentos e bilhetes em um só lugar.</p>
          </div>
          <Link className="viagem-selecionar reserva-nova" href="/#buscar">
            <span aria-hidden="true">＋</span>
            Encontrar nova viagem
          </Link>
        </header>
        {estado === "autenticado" && <ConteudoMinhasViagens />}
        {estado === "anonimo" && (
          <div className="viagem-vazia">
            <p>Entre na sua conta para ver suas reservas.</p>
            <Link className="viagem-selecionar" href="/login">Entrar</Link>
          </div>
        )}
      </Container>
    </main>
  );
}
