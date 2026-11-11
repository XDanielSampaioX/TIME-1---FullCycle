import Image from "next/image";
import type { useFiltrosViagem } from "../hooks/useFiltrosViagem";
import { ClasseViagem } from "../types/viagem";
import { ROTULOS_CLASSE_VIAGEM } from "../utils/rotulosClasseViagem";
import { formatarValorEmReais } from "@/shared/utils/formatarValorEmReais";

const periodos = [
  { valor: 0, titulo: "Madrugada (00:00 - 06:00)" },
  { valor: 1, titulo: "Manhã (06:00 - 12:00)" },
  { valor: 2, titulo: "Tarde (12:00 - 18:00)" },
  { valor: 3, titulo: "Noite (18:00 - 00:00)" },
];
const classes = (Object.keys(ROTULOS_CLASSE_VIAGEM) as ClasseViagem[])
  .map((valor) => ({ valor, titulo: ROTULOS_CLASSE_VIAGEM[valor] }));

function alternar<T>(lista: T[], valor: T, marcado: boolean) {
  return marcado ? [...lista, valor] : lista.filter((item) => item !== valor);
}

export function FiltrosViagem({ controle }: {
  controle: ReturnType<typeof useFiltrosViagem>;
}) {
  const { filtros, setFiltros, limitePreco, limpar } = controle;
  const precoMaximo = Math.min(filtros.precoMaximo, limitePreco);

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
              onChange={(event) => setFiltros({ ...filtros, periodos: alternar(filtros.periodos, valor, event.target.checked) })}
            />
            <span>{titulo}</span>
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
              onChange={(event) => setFiltros({ ...filtros, classes: alternar(filtros.classes, valor, event.target.checked) })}
            />
            <span>{titulo}</span>
          </label>
        ))}
      </fieldset>
      <Image className="viagem-divisor" src="/viagens/divisor-filtros.svg" width={232} height={1} alt="" />
      <fieldset className="viagem-precos">
        <legend>FAIXA DE PREÇO</legend>
        <div>
          <output>{formatarValorEmReais(filtros.precoMinimo)}</output>
          <output>{formatarValorEmReais(precoMaximo)}</output>
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
