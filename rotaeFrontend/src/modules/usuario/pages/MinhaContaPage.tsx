"use client";

import Link from "next/link";
import { useAutenticacao } from "@/modules/autenticacao/hooks/useAutenticacao";
import { Container } from "@/shared/components/Container";
import { FormularioAlteracaoSenha } from "../components/FormularioAlteracaoSenha";
import { FormularioEdicaoDados } from "../components/FormularioEdicaoDados";
import { PerfilUsuario } from "../components/PerfilUsuario";
import { useClienteMontado } from "../hooks/useClienteMontado";

const classeSecao = "grid gap-6 rounded-(--radius-lg) bg-(--color-surface-card) p-6 shadow-(--shadow-card)";

export function MinhaContaPage() {
  const { usuario } = useAutenticacao();
  const montado = useClienteMontado();

  if (!montado) return <main className="flex-1 py-12" />;

  if (!usuario) {
    return (
      <main className="flex-1 py-12">
        <Container className="max-w-md">
          <section className={classeSecao}>
            <h1 className="m-0 text-2xl font-extrabold">Minha conta</h1>
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
      <Container className="grid max-w-md gap-6">
        <h1 className="m-0 text-2xl font-extrabold">Minha conta</h1>
        <section aria-labelledby="titulo-perfil" className={classeSecao}>
          <h2 className="m-0 text-lg font-extrabold" id="titulo-perfil">Perfil</h2>
          <PerfilUsuario usuario={usuario} />
        </section>
        <section aria-labelledby="titulo-edicao" className={classeSecao}>
          <h2 className="m-0 text-lg font-extrabold" id="titulo-edicao">Editar dados</h2>
          <FormularioEdicaoDados usuario={usuario} />
        </section>
        <section aria-labelledby="titulo-senha" className={classeSecao}>
          <h2 className="m-0 text-lg font-extrabold" id="titulo-senha">Alterar senha</h2>
          <FormularioAlteracaoSenha usuario={usuario} />
        </section>
      </Container>
    </main>
  );
}
