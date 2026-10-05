import type { useFiltrosViagem } from "../hooks/useFiltrosViagem";

export function OrdenacaoViagens({ controle, total }: {
  controle: ReturnType<typeof useFiltrosViagem>;
  total: number;
}) {
  return (
    <div className="viagem-ordenacao">
      <strong role="status">{total} {total === 1 ? "viagem encontrada" : "viagens encontradas"}</strong>
      <div role="group" aria-label="Ordenar viagens">
        <span>Ordenar por:</span>
        {controle.ordenacoes.map((ordenacao) => (
          <button type="button" key={ordenacao.id} aria-pressed={ordenacao.id === controle.ordenacaoId} onClick={() => controle.setOrdenacaoId(ordenacao.id)}>
            {ordenacao.titulo}
          </button>
        ))}
      </div>
    </div>
  );
}
