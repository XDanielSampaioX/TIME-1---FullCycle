"use client";

import { useState } from "react";
import { Paginacao } from "@/shared/components/Paginacao";
import type { Reserva } from "../types/reserva";
import { separarReservas } from "../utils/regrasReserva";
import { CardReserva } from "./CardReserva";
import { ModalDetalhesReserva } from "./ModalDetalhesReserva";

const RESERVAS_POR_PAGINA = 5;

// Aplica o filtro e a paginação e separa as reservas entre próximas viagens e histórico.
export function ListaReservas({ reservas, agora, aoAtualizar }: {
  reservas: Reserva[];
  agora: Date;
  aoAtualizar: () => void;
}) {
  const [filtroAtual, setFiltroAtual] = useState(0);
  const [paginaEscolhida, setPaginaEscolhida] = useState(1);
  const [detalheId, setDetalheId] = useState<number | null>(null);

  const { proximas, historico } = separarReservas(reservas, agora);
  const filtros = [
    { titulo: "Todas", lista: [...proximas, ...historico] },
    { titulo: "Próximas", lista: proximas },
    { titulo: "Histórico", lista: historico },
  ];
  const secoes = [
    { titulo: "Próximas viagens", complemento: proximas.length === 1 ? "1 reserva" : `${proximas.length} reservas`, destaque: "proximas", lista: proximas, compacto: false },
    { titulo: "Histórico", complemento: "Últimos 90 dias", destaque: "historico", lista: historico, compacto: true },
  ];

  const filtradas = filtros[filtroAtual].lista;
  const totalPaginas = Math.max(Math.ceil(filtradas.length / RESERVAS_POR_PAGINA), 1);
  // Se reservas saírem da lista, a página escolhida pode deixar de existir.
  const pagina = Math.min(paginaEscolhida, totalPaginas);
  const visiveis = filtradas.slice((pagina - 1) * RESERVAS_POR_PAGINA, pagina * RESERVAS_POR_PAGINA);

  return (
    <>
      <div className="reserva-filtros" role="group" aria-label="Filtrar reservas">
        {filtros.map(({ titulo, lista }, indice) => (
          <button
            type="button"
            key={titulo}
            aria-pressed={indice === filtroAtual}
            onClick={() => {
              setFiltroAtual(indice);
              setPaginaEscolhida(1);
            }}
          >
            {titulo}
            <span>{lista.length}</span>
          </button>
        ))}
      </div>
      {secoes.map(({ titulo, complemento, destaque, lista, compacto }) => {
        const cartoes = visiveis.filter((reserva) => lista.includes(reserva));
        if (!cartoes.length) return null;

        return (
          <section className="reserva-secao" key={titulo}>
            <div className="reserva-secao-titulo" data-destaque={destaque}>
              <h2>{titulo}</h2>
              <span>{complemento}</span>
            </div>
            {cartoes.map((reserva) => (
              <CardReserva
                key={reserva.id}
                reserva={reserva}
                agora={agora}
                compacto={compacto}
                aoVerDetalhes={() => setDetalheId(reserva.id)}
                aoAtualizar={aoAtualizar}
              />
            ))}
          </section>
        );
      })}
      {!visiveis.length && (
        <div className="viagem-vazia" role="status">
          <p>Nenhuma reserva neste filtro.</p>
        </div>
      )}
      <Paginacao
        resumo={`Página ${pagina} de ${totalPaginas}`}
        anterior={pagina > 1 ? String(pagina - 1) : null}
        proxima={pagina < totalPaginas ? String(pagina + 1) : null}
        onNavegar={(destino) => setPaginaEscolhida(Number(destino))}
      />
      {detalheId !== null && (
        <ModalDetalhesReserva key={detalheId} reservaId={detalheId} agora={agora} aoFechar={() => setDetalheId(null)} />
      )}
    </>
  );
}
