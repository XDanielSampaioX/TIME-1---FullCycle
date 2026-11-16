"use client";

import { useCarregarDados } from "../hooks/useCarregarDados";
import { buscarReserva } from "../services/buscarReserva";
import { AvisoDeErro } from "./AvisoDeErro";
import { ConfirmacaoReserva } from "./ConfirmacaoReserva";

// A hora da resposta é a referência para saber se o prazo da reserva já acabou.
async function buscarComHorario(reservaId: number) {
  return { reserva: await buscarReserva(reservaId), agora: new Date() };
}

// Última etapa do checkout: busca a reserva e mostra o mesmo bilhete do modal de "Minhas viagens".
export function EtapaConfirmacao({ reservaId }: { reservaId: number }) {
  const { dados, erro, carregando, recarregar } = useCarregarDados(
    buscarComHorario,
    reservaId,
    "Não foi possível carregar a reserva.",
  );

  if (carregando) return <p className="viagem-estado" role="status">Carregando reserva…</p>;
  if (erro || !dados) return <AvisoDeErro mensagem={erro ?? "Não foi possível carregar a reserva."} aoTentarNovamente={recarregar} />;

  return <ConfirmacaoReserva reserva={dados.reserva} agora={dados.agora} dentroDoModal={false} />;
}
