import type { ViagemAssento } from "../types/viagemAssento";

export function MapaAssentos({ assentos, selecionados, alternar, verificando }: {
  assentos: ViagemAssento[];
  selecionados: number[];
  alternar: (id: number) => void;
  verificando: boolean;
}) {
  return (
    <section className="assento-mapa">
      <h1>Selecione sua poltrona</h1>
      <p>Selecione no mínimo uma poltrona. Você pode escolher até todas as disponíveis.</p>
      <div className="assento-onibus">
        <div className="assento-frente">
          <span>FRENTE DO ÔNIBUS</span>
          <span>⎔ Volante</span>
        </div>
        <div className="assento-grade" role="group" aria-label="Poltronas do ônibus">
          {assentos.map((assento) => {
            const disponivel = assento.status === "DISPONIVEL";
            const selecionado = selecionados.includes(assento.assentoId);
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
                disabled={!disponivel || verificando}
                data-ocupado={!disponivel}
                aria-pressed={selecionado}
                aria-label={`Poltrona ${assento.numero}, ${!disponivel ? "indisponível" : selecionado ? "selecionada" : "disponível"}`}
                onClick={() => alternar(assento.assentoId)}
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
