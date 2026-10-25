"use client";

import Link from "next/link";
import { useState } from "react";
import { useAutenticacao } from "@/modules/autenticacao/hooks/useAutenticacao";
import { Container } from "@/shared/components/Container";
import { useClienteMontado } from "@/shared/hooks/useClienteMontado";
import { AreaSeguranca } from "../components/AreaSeguranca";
import { FormularioEdicaoPerfil } from "../components/FormularioEdicaoPerfil";

const classeCartao = "rounded-(--radius-lg) bg-(--color-surface-card) p-6 shadow-(--shadow-card)";

export function EdicaoPerfilPage() {
  const { usuario } = useAutenticacao();
  const montado = useClienteMontado();
  // Trocar a chave recria o formulário, e "Cancelar" volta tudo ao que está salvo.
  const [versaoFormulario, setVersaoFormulario] = useState(0);

  if (!montado) return <main className="flex-1 py-12" />;

  if (!usuario) {
    return (
      <main className="flex-1 py-12">
        <Container className="max-w-md">
          <section className={`grid gap-4 ${classeCartao}`}>
            <h1 className="m-0 text-2xl font-extrabold">Meu perfil</h1>
            <p className="m-0">Entre na sua conta para ver e editar seus dados.</p>
            <Link className="font-bold" href="/login">
              Entrar
            </Link>
          </section>
        </Container>
      </main>
    );
  }

  return (
    <main className="flex-1 py-12">
      <Container className="grid max-w-3xl gap-6">
        <header className="grid gap-1">
          <h1 className="m-0 text-3xl font-extrabold">Meu perfil</h1>
          <p className="m-0 text-sm text-(--color-text-secondary)">Gerencie suas informações pessoais</p>
        </header>
        <div className={classeCartao}>
          <FormularioEdicaoPerfil
            key={versaoFormulario}
            usuario={usuario}
            aoCancelar={() => setVersaoFormulario(versaoFormulario + 1)}
          />
        </div>
        <AreaSeguranca />
      </Container>
    </main>
  );
}
