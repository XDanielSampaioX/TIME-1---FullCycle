"use client";

import { useViagem } from "@/modules/viagem/hooks/useViagem";
import { consultarViagensDisponiveis } from "@/modules/viagem/utils/consultarViagensDisponiveis";
import type { BuscaViagem } from "@/modules/viagem/types/buscaViagem";
import { Button } from "@/shared/components/Button";
import { SelecaoAssentos } from "./SelecaoAssentos";

export function ConteudoSelecaoAssentos({ viagemId, busca }: { viagemId: number; busca: BuscaViagem }) {
  const { viagens, cidades, assentos, assentosViagens, carregando, erro, recarregar } = useViagem();
  const resultado = consultarViagensDisponiveis(viagens, cidades, assentos, assentosViagens, { ...busca, origem: "", destino: "", partida: "" })
    .find((item) => item.viagem.id === viagemId);

  if (carregando) return <p className="viagem-estado" role="status">Carregando poltronas…</p>;
  if (erro) {
    return (
      <div className="viagem-estado" role="alert">
        <p>{erro}</p>
        <Button onClick={recarregar}>Tentar novamente</Button>
      </div>
    );
  }
  if (!resultado) return <p className="viagem-estado" role="status">Esta viagem não está disponível para a quantidade de passageiros escolhida.</p>;

  return <SelecaoAssentos resultado={resultado} quantidade={busca.passageiros} />;
}
