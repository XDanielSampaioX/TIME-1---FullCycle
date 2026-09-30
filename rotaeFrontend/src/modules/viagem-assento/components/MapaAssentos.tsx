import type { Assento } from "@/modules/assento/types/assento";
import type { ViagemAssento } from "../types/viagemAssento";

export function MapaAssentos({ assentos, disponibilidades, selecionados, quantidade, alternar, verificando }: {
  assentos: Assento[];
  disponibilidades: ViagemAssento[];
  selecionados: number[];
  quantidade: number;
  alternar: (id: number) => void;
  verificando: boolean;
}) {
  return (
    <section className="assento-mapa">
      <h1>Selecione sua poltrona</h1>
      <p>Escolha {quantidade} {quantidade === 1 ? "assento para sua viagem" : "assentos para sua viagem"}.</p>
      <div className="assento-onibus">
        <div className="assento-frente">
          <span>FRENTE DO ÔNIBUS</span>
          <span>⎔ Volante</span>
        </div>
        <div className="assento-grade" role="group" aria-label="Poltronas do ônibus">
          {assentos.map((assento) => {
            const disponivel = disponibilidades.some((item) => item.assentoId === assento.id && item.status === "DISPONIVEL");
            const selecionado = assento.id !== undefined && selecionados.includes(assento.id);
            const limite = selecionados.length >= quantidade && !selecionado;
            const posicao = (assento.numero - 1) % 4;

            return (
              <button
                type="button"
                key={assento.id}
                className="assento-poltrona"
                style={{
                  gridColumn: posicao < 2 ? posicao + 1 : posicao + 2,
                  gridRow: Math.floor((assento.numero - 1) / 4) + 1,
                }}
                disabled={assento.id === undefined || !disponivel || limite || verificando}
                data-ocupado={!disponivel}
                aria-pressed={selecionado}
                aria-label={`Poltrona ${assento.numero}, ${!disponivel ? "indisponível" : selecionado ? "selecionada" : "disponível"}`}
                onClick={() => assento.id !== undefined && alternar(assento.id)}
              >
                {assento.numero}
              </button>
            );
          })}
          <span className="assento-corredor" aria-hidden="true">CORREDOR</span>
        </div>
        {!assentos.length && <p>Nenhum assento cadastrado para este ônibus.</p>}
      </div>
      <div className="assento-legenda">
        <span>
          <i />
          Disponível
        </span>
        <span>
          <i data-selecionado />
          Selecionada
        </span>
        <span>
          <i data-ocupado />
          Ocupada
        </span>
      </div>
    </section>
  );
}
