"use client";

import { CardViagem } from "./CardViagem";
import { FiltrosViagem } from "./FiltrosViagem";
import { OrdenacaoViagens } from "./OrdenacaoViagens";
import { useViagem } from "../hooks/useViagem";
import { useFiltrosViagem } from "../hooks/useFiltrosViagem";
import type { BuscaViagem } from "../types/buscaViagem";
import { Button } from "@/shared/components/Button";
import { Paginacao } from "@/shared/components/Paginacao";

export function ListaViagens({ busca }: { busca: BuscaViagem }) {
  const { viagens, paginaViagens, cidades, cidadesCarregadas, carregando, erro, recarregar, navegarPaginaViagens, consultarViagens } = useViagem();
  const controle = useFiltrosViagem(viagens, busca, cidades, cidadesCarregadas, consultarViagens);

  if (erro) {
    return (
      <div className="viagem-estado" role="alert">
        <p>{erro}</p>
        <Button onClick={recarregar}>Tentar novamente</Button>
      </div>
    );
  }
  if (carregando || !cidadesCarregadas) return <p className="viagem-estado" role="status">Buscando viagens disponíveis…</p>;

  return (
    <div className="viagem-conteudo">
      <FiltrosViagem controle={controle} />
      <section className="viagem-resultados" aria-label="Resultados da busca">
        <OrdenacaoViagens controle={controle} total={paginaViagens?.count ?? 0} />
        <div className="viagem-lista">
          {controle.resultados.map((resultado) => (
            <CardViagem
              key={resultado.id}
              resultado={resultado}
              busca={busca}
              recomendado={controle.ordenacaoId === "preco" && resultado === controle.resultados[0]}
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
        {paginaViagens && (
          <Paginacao
            resumo={`${paginaViagens.count} viagens no total`}
            anterior={paginaViagens.previous}
            proxima={paginaViagens.next}
            carregando={carregando}
            onNavegar={navegarPaginaViagens}
          />
        )}
      </section>
    </div>
  );
}
