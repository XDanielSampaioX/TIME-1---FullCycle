import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/Button";
import type { ViagemDisponivel } from "@/modules/viagem/types/viagemDisponivel";
import type { ViagemAssento } from "@/modules/viagem-assento/types/viagemAssento";
import type { useSelecaoAssentos } from "../hooks/useSelecaoAssentos";

export function ResumoSelecaoAssentos({ resultado, assentos, selecao }: {
  resultado: ViagemDisponivel;
  assentos: ViagemAssento[];
  selecao: ReturnType<typeof useSelecaoAssentos>;
}) {
  const router = useRouter();
  const viagem = resultado;
  const { origem, destino } = viagem;
  const moeda = (valor: number) => (valor / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const numeros = assentos.filter((assento) => selecao.selecionados.includes(assento.assentoId)).map((assento) => assento.numero);

  async function continuar() {
    if (!await selecao.confirmar()) return;

    router.push(``);
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
          <dd>{selecao.selecionados.length}</dd>
        </div>
      </dl>
      <Image src="/viagens/divisor-resumo.svg" width={332} height={1} alt="" />
      <div className="assento-total">
        <strong>Total</strong>
        <strong>{moeda(viagem.precoCentavos * selecao.selecionados.length)}</strong>
      </div>
      <Button
        className="viagem-selecionar"
        disabled={selecao.selecionados.length === 0 || selecao.verificando}
        onClick={() => void continuar()}
      >
        {selecao.verificando ? "Verificando…" : "Confirmar seleção"}
      </Button>
      {selecao.erro && <p role="alert">{selecao.erro}</p>}
    </aside>
  );
}
