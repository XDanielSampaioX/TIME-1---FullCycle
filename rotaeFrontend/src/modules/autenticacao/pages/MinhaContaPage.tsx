"use client";

import { RotaProtegida } from "@/modules/autenticacao/components/RotaProtegida";
import { useSessao } from "@/modules/autenticacao/contexts/SessaoContext";

export function MinhaContaPage() {
  const { usuario } = useSessao();
  return (
    <RotaProtegida>
      <main className="usuario-page">
        <section className="usuario-card">
          <p className="usuario-eyebrow">Minha conta</p>
          <h1>Olá, {usuario?.nome}</h1>
          <p className="usuario-description">E-mail: {usuario?.email}</p>
        </section>
      </main>
    </RotaProtegida>
  );
}
