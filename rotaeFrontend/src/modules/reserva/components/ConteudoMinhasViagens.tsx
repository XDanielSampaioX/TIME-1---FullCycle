"use client";

import Link from "next/link";
import { CardViagemSkeleton } from "@/modules/viagem/components/CardViagemSkeleton";
import { useCarregarDados } from "../hooks/useCarregarDados";
import { listarMinhasReservas } from "../services/listarMinhasReservas";
import { AvisoDeErro } from "./AvisoDeErro";
import { ListaReservas } from "./ListaReservas";

// A hora da resposta é a referência das telas para prazos e para separar próximas e histórico.
async function consultarComHorario() {
  return { reservas: await listarMinhasReservas(), agora: new Date() };
}

// Decide o que aparece: erro, carregando, lista vazia ou a lista de reservas.
export function ConteudoMinhasViagens() {
  const { dados, erro, recarregar } = useCarregarDados(consultarComHorario, undefined, "Não foi possível carregar suas reservas.");

  if (erro) return <AvisoDeErro mensagem={erro} aoTentarNovamente={recarregar} />;

  // Ao recarregar depois de um cancelamento, a lista atual fica na tela até a nova chegar.
  if (!dados) {
    return (
      <div className="reserva-secao" role="status" aria-busy="true">
        <span className="sr-only">Carregando suas reservas…</span>
        <CardViagemSkeleton />
        <CardViagemSkeleton />
      </div>
    );
  }

  if (!dados.reservas.length) {
    return (
      <div className="viagem-vazia">
        <h2>Você ainda não tem reservas</h2>
        <p>Encontre uma viagem e escolha sua poltrona para começar.</p>
        <Link className="viagem-selecionar" href="/#buscar">Encontrar viagem</Link>
      </div>
    );
  }

  return <ListaReservas reservas={dados.reservas} agora={dados.agora} aoAtualizar={recarregar} />;
}
