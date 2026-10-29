"use client";

import Link from "next/link";
import { useState } from "react";
import { useAutenticacao } from "@/modules/autenticacao/hooks/useAutenticacao";
import { Container } from "@/shared/components/Container";
import { AreaSeguranca } from "../components/AreaSeguranca";
import { FormularioEdicaoPerfil } from "../components/FormularioEdicaoPerfil";
import { useExclusaoConta } from "../hooks/useExclusaoConta";

const classeCartao = "rounded-(--radius-lg) bg-(--color-surface-card) p-6 shadow-(--shadow-card)";

export function EdicaoPerfilPage() {
  const { usuario, estado } = useAutenticacao();
  const exclusao = useExclusaoConta();
  // Trocar a chave recria o formulário, e "Cancelar" volta tudo ao que está salvo.
  const [versaoFormulario, setVersaoFormulario] = useState(0);

  if (estado === "carregando") return <main className="flex-1 py-12" />;

  // Logo depois da exclusão a sessão já acabou, mas a rota ainda não mudou: sem este aviso,
  // a tela de visitante ("Entre na sua conta") apareceria por um instante.
  if (exclusao.excluida) {
    return (
      <main className="flex-1 py-12">
        <Container className="max-w-md">
          <p className="m-0 text-center" role="status">
            Conta desativada. Levando você para a página inicial...
          </p>
        </Container>
      </main>
    );
  }

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
        <AreaSeguranca exclusao={exclusao} />
      </Container>
    </main>
  );
}
