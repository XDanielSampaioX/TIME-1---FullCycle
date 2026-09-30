"use client";

import { CardViagem } from "./CardViagem";
import { FiltrosViagem } from "./FiltrosViagem";
import { OrdenacaoViagens } from "./OrdenacaoViagens";
import { useViagem } from "../hooks/useViagem";
import { useFiltrosViagem } from "../hooks/useFiltrosViagem";
import { consultarViagensDisponiveis } from "../utils/consultarViagensDisponiveis";
import type { BuscaViagem } from "../types/buscaViagem";
import { Button } from "@/shared/components/Button";

export function ListaViagens({ busca }: { busca: BuscaViagem }) {
  const { viagens, cidades, assentos, assentosViagens, carregando, erro, recarregar } = useViagem();
  const disponiveis = consultarViagensDisponiveis(viagens, cidades, assentos, assentosViagens, busca);
  const controle = useFiltrosViagem(disponiveis);

  if (carregando) return <p className="viagem-estado" role="status">Buscando viagens disponíveis…</p>;
  if (erro) {
    return (
      <div className="viagem-estado" role="alert">
        <p>{erro}</p>
        <Button onClick={recarregar}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className="viagem-conteudo">
      <FiltrosViagem viagens={disponiveis} controle={controle} />
      <section className="viagem-resultados" aria-label="Resultados da busca">
        <OrdenacaoViagens controle={controle} />
        <div className="viagem-lista">
          {controle.resultados.map((resultado) => (
            <CardViagem
              key={resultado.viagem.id}
              resultado={resultado}
              busca={busca}
              recomendado={resultado === controle.resultados.find((item) => item.viagem.precoCentavos === controle.menorPreco)}
            />
          ))}
          {!controle.resultados.length && (
            <div className="viagem-vazia" role="status">
              <h2>Nenhuma viagem encontrada</h2>
              <p>Experimente outros horários, preços ou altere a origem, o destino e a data da busca.</p>
              <Button variant="secondary" onClick={controle.limpar}>Limpar filtros</Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
