"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Button } from "@/shared/components/Button";
import { useCancelarReserva } from "../hooks/useCancelarReserva";
import type { Reserva } from "../types/reserva";
import type { StatusReserva } from "../types/statusReserva";

const VERDE = "viagem-selecionar";
const BRANCO = "viagem-selecionar reserva-botao-branco";
const VERMELHO = "viagem-selecionar reserva-botao-vermelho";

// Botões do cartão. Cada status mostra botões diferentes, e cancelar pede confirmação antes.
// semPassageiros: o backend ainda não tem passageiros nesta reserva.
export function BotoesReserva({ reserva, statusAtual, semPassageiros, aoVerDetalhes, aoAtualizar }: {
  reserva: Reserva;
  statusAtual: StatusReserva;
  semPassageiros: boolean;
  aoVerDetalhes: () => void;
  aoAtualizar: () => void;
}) {
  const [confirmando, setConfirmando] = useState(false);
  const { cancelando, erro, cancelar } = useCancelarReserva(() => {
    setConfirmando(false);
    aoAtualizar();
  });
  const { viagem } = reserva;
  const busca = new URLSearchParams({ origem: String(viagem.origem.id), destino: String(viagem.destino.id) });

  if (confirmando) {
    return (
      <div className="reserva-confirmacao" role="group" aria-label="Confirmar cancelamento">
        <p>Cancelar esta reserva? As poltronas serão liberadas.</p>
        <div className="reserva-acoes">
          {/* O foco começa na opção que não cancela nada. */}
          <Button className={BRANCO} type="button" autoFocus disabled={cancelando} onClick={() => setConfirmando(false)}>
            Voltar
          </Button>
          <Button className={VERMELHO} type="button" disabled={cancelando} onClick={() => void cancelar(reserva.id)}>
            {cancelando ? "Cancelando…" : "Sim, cancelar"}
          </Button>
        </div>
        {erro && <p role="alert">{erro}</p>}
      </div>
    );
  }

  const botaoCancelar = <Button className={BRANCO} type="button" onClick={() => setConfirmando(true)}>Cancelar</Button>;
  const botaoDetalhes = (titulo: string, classe = BRANCO) => (
    <Button className={classe} type="button" onClick={aoVerDetalhes}>{titulo}</Button>
  );
  const verBilhetes = reserva.totalAssentos === 1 ? "Ver bilhete" : `Ver ${reserva.totalAssentos} bilhetes`;
  const buscarNovamente = <Link className={BRANCO} href={`/viagens?${busca}`}>Buscar novamente</Link>;

  const acoes: Record<StatusReserva, ReactNode> = {
    PAGAMENTO_PENDENTE: (
      <>
        {botaoCancelar}
        {/* Sem passageiros, falta essa etapa. Com eles, o checkout pula o pagamento (issue #23) e o bilhete já aparece. */}
        {semPassageiros
          ? <Link className={VERDE} href={`/reservas/${reserva.id}/passageiros`}>Informar passageiros</Link>
          : botaoDetalhes(verBilhetes, VERDE)}
      </>
    ),
    PAGO: (
      <>
        {botaoDetalhes("Detalhes")}
        {botaoDetalhes(verBilhetes, VERDE)}
      </>
    ),
    // Enquanto o backend não expira reservas (issue #20), cancelar é o que libera as poltronas.
    EXPIRADO: (
      <>
        {reserva.status === "PAGAMENTO_PENDENTE" && botaoCancelar}
        {buscarNovamente}
      </>
    ),
    FALHA: (
      <>
        {botaoDetalhes("Detalhes")}
        <Link className={VERDE} href={`/viagens/${viagem.id}/assentos`}>Tentar de novo</Link>
      </>
    ),
    CANCELADO: (
      <>
        {buscarNovamente}
        {botaoDetalhes("Ver detalhes")}
      </>
    ),
  };

  return <div className="reserva-acoes">{acoes[statusAtual]}</div>;
}
