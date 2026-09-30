import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/Button";
import { salvarSessaoCheckout } from "@/modules/reserva/services/sessaoCheckoutStorage";
import type { ViagemDisponivel } from "@/modules/viagem/types/viagemDisponivel";
import type { Assento } from "@/modules/assento/types/assento";
import type { useSelecaoAssentos } from "../hooks/useSelecaoAssentos";

export function ResumoSelecaoAssentos({ resultado, assentos, quantidade, selecao }: {
  resultado: ViagemDisponivel;
  assentos: Assento[];
  quantidade: number;
  selecao: ReturnType<typeof useSelecaoAssentos>;
}) {
  const router = useRouter();
  const { viagem, origem, destino } = resultado;
  const moeda = (valor: number) => (valor / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const numeros = assentos.filter((assento) => assento.id !== undefined && selecao.selecionados.includes(assento.id)).map((assento) => assento.numero);

  async function continuar() {
    if (!await selecao.confirmar() || viagem.id === undefined) return;

    salvarSessaoCheckout({
      viagemId: viagem.id,
      assentoIds: selecao.selecionados,
      numerosAssentos: numeros,
      passageiros: [],
    });
    router.push(`/viagens/${viagem.id}/passageiros`);
  }

  return (
    <aside className="assento-resumo" aria-label="Resumo da viagem">
      <h2>Resumo da viagem</h2>
      <strong>{origem.nome} → {destino.nome}</strong>
      <span className="viagem-badge">{viagem.classe === "EXECUTIVA" ? "Executiva" : viagem.classe === "CONVENCIONAL" ? "Convencional" : "Classe não informada"}</span>
      <p>{new Date(viagem.partidaEm.slice(0, 10) + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })}</p>
      <strong>{viagem.partidaEm.slice(11, 16)} → {viagem.chegadaEm.slice(11, 16)} {viagem.chegadaEm.slice(0, 10) !== viagem.partidaEm.slice(0, 10) && "(dia seguinte)"}</strong>
      <Image src="/viagens/divisor-resumo.svg" width={332} height={1} alt="" />
      <dl>
        <div>
          <dt>Poltronas selecionadas</dt>
          <dd>{numeros.join(", ") || "Nenhuma"}</dd>
        </div>
        <div>
          <dt>Por passageiro</dt>
          <dd>{moeda(viagem.precoCentavos)}</dd>
        </div>
        <div>
          <dt>Passageiros</dt>
          <dd>{selecao.selecionados.length} de {quantidade}</dd>
        </div>
      </dl>
      <Image src="/viagens/divisor-resumo.svg" width={332} height={1} alt="" />
      <div className="assento-total">
        <strong>Total</strong>
        <strong>{moeda(viagem.precoCentavos * selecao.selecionados.length)}</strong>
      </div>
      <Button
        className="viagem-selecionar"
        disabled={selecao.selecionados.length !== quantidade || selecao.verificando}
        onClick={() => void continuar()}
      >
        {selecao.verificando ? "Verificando…" : "Confirmar seleção"}
      </Button>
      {selecao.erro && <p role="alert">{selecao.erro}</p>}
    </aside>
  );
}
