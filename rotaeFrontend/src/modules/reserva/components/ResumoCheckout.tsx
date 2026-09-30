import type { SessaoCheckout } from "../types/sessaoCheckout";
import type { ViagemDisponivel } from "@/modules/viagem/types/viagemDisponivel";
import { formatarValorEmReais } from "@/shared/utils/formatarValorEmReais";

export function ResumoCheckout({ sessao, resultado }: { sessao: SessaoCheckout; resultado: ViagemDisponivel }) {
  const { viagem, origem, destino } = resultado;

  return (
    <aside className="checkout-resumo" aria-label="Resumo da viagem">
      <h2>Resumo da viagem</h2>
      <strong>{origem.nome} → {destino.nome}</strong>
      <span className="checkout-badge">{viagem.classe?.toLowerCase().replace("_", "-") ?? "Convencional"}</span>
      <p>{new Date(`${viagem.partidaEm.slice(0, 10)}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })}</p>
      <strong>{viagem.partidaEm.slice(11, 16)} → {viagem.chegadaEm.slice(11, 16)}</strong>
      <hr />
      <dl>
        <div>
          <dt>Assentos selecionados</dt>
          <dd>{sessao.numerosAssentos.join(" e ")}</dd>
        </div>
        <div>
          <dt>Passageiros</dt>
          <dd>{sessao.assentoIds.length}</dd>
        </div>
      </dl>
      <hr />
      <div className="checkout-total">
        <strong>Total</strong>
        <strong>{formatarValorEmReais(viagem.precoCentavos * sessao.assentoIds.length)}</strong>
      </div>
    </aside>
  );
}
