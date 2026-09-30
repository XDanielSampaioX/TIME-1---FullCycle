"use client";

import { useMemo, useState } from "react";
import { useReserva } from "@/modules/reserva/hooks/useReserva";
import { CardReserva } from "@/modules/reserva/components/CardReserva";

type FiltroReserva = "TODAS" | "PROXIMAS" | "HISTORICO";

export function ListaReservas() {
  const { reservas, carregando, erro, cancelar } = useReserva();
  const [filtro, setFiltro] = useState<FiltroReserva>("TODAS");
  const proximas = useMemo(() => reservas.filter((reserva) => reserva.status === "PAGAMENTO_PENDENTE" || reserva.status === "PAGO"), [reservas]);
  const historico = useMemo(() => reservas.filter((reserva) => !proximas.includes(reserva)), [reservas, proximas]);

  if (carregando) return <p role="status">Carregando reservas...</p>;
  if (erro) return <p role="alert">{erro}</p>;
  if (reservas.length === 0) return <p>Nenhuma reserva encontrada.</p>;

  const grupos = [
    { chave: "PROXIMAS" as const, titulo: "Próximas viagens", descricao: `${proximas.length} reserva${proximas.length === 1 ? "" : "s"}`, reservas: proximas },
    { chave: "HISTORICO" as const, titulo: "Histórico", descricao: "Reservas anteriores", reservas: historico },
  ];

  return <>
    <div className="reserva-filters" aria-label="Filtrar viagens">
      {(["TODAS", "PROXIMAS", "HISTORICO"] as const).map((opcao) => {
        const quantidade = opcao === "TODAS" ? reservas.length : opcao === "PROXIMAS" ? proximas.length : historico.length;
        return <button className={filtro === opcao ? "active" : ""} key={opcao} type="button" onClick={() => setFiltro(opcao)}>{opcao === "TODAS" ? "Todas" : opcao === "PROXIMAS" ? "Próximas" : "Histórico"}<span>{quantidade}</span></button>;
      })}
    </div>
    <div className="reserva-lista">
      {grupos.filter((grupo) => filtro === "TODAS" || filtro === grupo.chave).map((grupo) => grupo.reservas.length > 0 && (
        <section className="reserva-group" key={grupo.chave}>
          <header><h2>{grupo.titulo}</h2><span>{grupo.descricao}</span></header>
          {grupo.reservas.map((reserva) => <CardReserva key={reserva.id} reserva={reserva} onCancelar={(id) => void cancelar(id)} />)}
        </section>
      ))}
    </div>
  </>;
}
