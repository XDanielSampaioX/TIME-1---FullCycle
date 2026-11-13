import Image from "next/image";
import type { ReactNode } from "react";
import { formatarValorEmReais } from "@/shared/utils/formatarValorEmReais";
import type { Reserva } from "../types/reserva";
import {
  formatarClasse, formatarDiaDaViagem, formatarHorariosDaViagem, formatarPoltronas,
} from "../utils/formatarReserva";

const divisor = <Image src="/viagens/divisor-resumo.svg" width={332} height={1} alt="" />;

// O card "Resumo da viagem" da etapa de passageiros. Usa as classes do resumo da tela de assentos,
// que tem o mesmo visual no Figma. `children` é a ação da etapa (o botão de enviar).
export function ResumoReserva({ reserva, children }: { reserva: Omit<Reserva, "passageiros">; children: ReactNode }) {
  const { viagem } = reserva;

  return (
    <aside className="assento-resumo reserva-resumo" aria-label="Resumo da viagem">
      <h2>Resumo da viagem</h2>
      <div className="reserva-resumo-rota">
        <strong>{viagem.origem.nome}</strong>
        <span aria-hidden="true">➔</span>
        <strong>{viagem.destino.nome}</strong>
        <span className="viagem-badge">{formatarClasse(viagem)}</span>
      </div>
      <p>{formatarDiaDaViagem(viagem)}</p>
      <strong>{formatarHorariosDaViagem(viagem)}</strong>
      {divisor}
      <dl>
        <div>
          <dt>Assentos selecionados</dt>
          <dd>{formatarPoltronas(reserva.assentos)}</dd>
        </div>
        <div>
          <dt>Passagens</dt>
          <dd>{reserva.totalAssentos}</dd>
        </div>
        <div>
          <dt>Taxa de serviço</dt>
          <dd>Grátis</dd>
        </div>
      </dl>
      {divisor}
      <div className="assento-total">
        <strong>Total</strong>
        <strong>{formatarValorEmReais(reserva.valorTotal)}</strong>
      </div>
      {children}
    </aside>
  );
}
