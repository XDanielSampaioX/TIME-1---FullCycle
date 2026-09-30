import Image from "next/image";
import type { ClasseViagem } from "../types/classeViagem";
import type { ViagemDisponivel } from "../types/viagemDisponivel";
import type { useFiltrosViagem } from "../hooks/useFiltrosViagem";

const periodos = [
  { valor: 0, titulo: "Madrugada (00:00 - 06:00)" },
  { valor: 1, titulo: "Manhã (06:00 - 12:00)" },
  { valor: 2, titulo: "Tarde (12:00 - 18:00)" },
  { valor: 3, titulo: "Noite (18:00 - 00:00)" },
];
const classes: { valor: ClasseViagem; titulo: string }[] = [
  { valor: "CONVENCIONAL", titulo: "Convencional" },
  { valor: "EXECUTIVA", titulo: "Executiva" },
];

export function FiltrosViagem({ viagens, controle }: {
  viagens: ViagemDisponivel[];
  controle: ReturnType<typeof useFiltrosViagem>;
}) {
  const { filtros, setFiltros, limitePreco, limpar } = controle;
  const precoMaximo = Math.min(filtros.precoMaximo, limitePreco);
  const moeda = (centavos: number) => (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <aside className="viagem-filtros" aria-label="Filtros de viagens">
      <div className="viagem-filtros-titulo">
        <h2>Filtros</h2>
        <button type="button" onClick={limpar}>LIMPAR TUDO</button>
      </div>
      <Image className="viagem-divisor" src="/viagens/divisor-filtros.svg" width={232} height={1} alt="" />
      <fieldset>
        <legend>HORÁRIO DE SAÍDA</legend>
        {periodos.map(({ valor, titulo }) => (
          <label className="viagem-filtro-opcao" key={valor}>
            <input
              type="checkbox"
              checked={filtros.periodos.includes(valor)}
              onChange={(event) => setFiltros({ ...filtros, periodos: event.target.checked ? [...filtros.periodos, valor] : filtros.periodos.filter((item) => item !== valor) })}
            />
            <span>{titulo}</span>
            <small>{viagens.filter(({ viagem }) => Math.floor(Number(viagem.partidaEm.slice(11, 13)) / 6) === valor).length}</small>
          </label>
        ))}
      </fieldset>
      <Image className="viagem-divisor" src="/viagens/divisor-filtros.svg" width={232} height={1} alt="" />
      <fieldset>
        <legend>CLASSE DO ÔNIBUS</legend>
        {classes.map(({ valor, titulo }) => (
          <label className="viagem-filtro-opcao" key={valor}>
            <input
              type="checkbox"
              checked={filtros.classes.includes(valor)}
              onChange={(event) => setFiltros({ ...filtros, classes: event.target.checked ? [...filtros.classes, valor] : filtros.classes.filter((item) => item !== valor) })}
            />
            <span>{titulo}</span>
            <small>{viagens.filter(({ viagem }) => viagem.classe === valor).length}</small>
          </label>
        ))}
      </fieldset>
      <Image className="viagem-divisor" src="/viagens/divisor-filtros.svg" width={232} height={1} alt="" />
      <fieldset className="viagem-precos">
        <legend>FAIXA DE PREÇO</legend>
        <div>
          <output>{moeda(filtros.precoMinimo)}</output>
          <output>{moeda(precoMaximo)}</output>
        </div>
        <label>
          Preço mínimo
          <input type="range" min={0} max={limitePreco} step={1} value={filtros.precoMinimo} onChange={(event) => setFiltros({ ...filtros, precoMinimo: Math.min(Number(event.target.value), precoMaximo) })} />
        </label>
        <label>
          Preço máximo
          <input type="range" min={0} max={limitePreco} step={1} value={precoMaximo} onChange={(event) => setFiltros({ ...filtros, precoMaximo: Math.max(Number(event.target.value), filtros.precoMinimo) })} />
        </label>
      </fieldset>
    </aside>
  );
}
