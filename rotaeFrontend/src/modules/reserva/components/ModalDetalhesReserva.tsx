"use client";

import { useEffect, useRef } from "react";
import { useCarregarDados } from "../hooks/useCarregarDados";
import { buscarReserva } from "../services/buscarReserva";
import { AvisoDeErro } from "./AvisoDeErro";
import { ConfirmacaoReserva } from "./ConfirmacaoReserva";

// Busca a reserva pelo id e mostra os detalhes em uma janela. Fecha com Esc, com clique no fundo ou com o botão.
export function ModalDetalhesReserva({ reservaId, agora, aoFechar }: {
  reservaId: number;
  agora: Date;
  aoFechar: () => void;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const { dados: reserva, erro, carregando, recarregar } = useCarregarDados(
    buscarReserva,
    reservaId,
    "Não foi possível carregar os detalhes da reserva.",
  );

  useEffect(() => {
    if (dialogo.current && !dialogo.current.open) dialogo.current.showModal();
  }, []);

  return (
    <dialog
      className="reserva-dialogo"
      ref={dialogo}
      aria-label="Detalhes da reserva"
      onClose={aoFechar}
      onClick={(evento) => {
        if (evento.target === dialogo.current) dialogo.current?.close();
      }}
    >
      {carregando && <p role="status">Carregando detalhes…</p>}
      {erro && <AvisoDeErro mensagem={erro} aoTentarNovamente={recarregar} />}
      {!carregando && !erro && reserva && <ConfirmacaoReserva reserva={reserva} agora={agora} dentroDoModal />}
    </dialog>
  );
}
