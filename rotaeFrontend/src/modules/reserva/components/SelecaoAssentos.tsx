"use client";

import { MapaAssentos } from "@/modules/viagem-assento/components/MapaAssentos";
import { ResumoSelecaoAssentos } from "@/modules/viagem-assento/components/ResumoSelecaoAssentos";
import { buscarViagem } from "@/modules/viagem/services/buscarViagem";
import type { BuscaViagem } from "@/modules/viagem/types/buscaViagem";
import type { ViagemDisponivel } from "@/modules/viagem/types/viagem";
import { consultarViagensDisponiveis } from "@/modules/viagem/utils/consultarViagensDisponiveis";
import { useCarregarDados } from "../hooks/useCarregarDados";
import { useMapaAssentos } from "../hooks/useMapaAssentos";
import { useSelecaoAssentos } from "../hooks/useSelecaoAssentos";
import { AvisoDeErro } from "./AvisoDeErro";

// O mapa e o resumo são os de viagem-assento. O que muda é o hook: aqui, confirmar cria a reserva.
function MapaDaViagem({ viagem }: { viagem: ViagemDisponivel }) {
  const { assentos, carregando, erro, atualizar } = useMapaAssentos(viagem.id);
  const selecao = useSelecaoAssentos(viagem.id, assentos, atualizar);

  if (carregando) return <p className="viagem-estado" role="status">Carregando assentos…</p>;
  if (erro) return <AvisoDeErro mensagem={erro} aoTentarNovamente={atualizar} />;

  return (
    <div className="assento-conteudo">
      <MapaAssentos assentos={assentos} {...selecao} />
      <ResumoSelecaoAssentos resultado={viagem} assentos={assentos} selecao={selecao} />
    </div>
  );
}

// Busca a viagem e confere se ela tem lugar para os passageiros antes de abrir o mapa.
export function SelecaoAssentos({ viagemId, busca }: { viagemId: number; busca: BuscaViagem }) {
  const { dados, erro, carregando, recarregar } = useCarregarDados(
    buscarViagem,
    viagemId,
    "Não foi possível carregar os dados da viagem.",
  );

  if (carregando) return <p className="viagem-estado" role="status">Carregando poltronas…</p>;
  if (erro) return <AvisoDeErro mensagem={erro} aoTentarNovamente={recarregar} />;

  const viagem = dados && consultarViagensDisponiveis([dados], {
    origem: "",
    destino: "",
    partida: "",
    passageiros: busca.passageiros ?? 1,
  })[0];

  if (!viagem) return <p className="viagem-estado" role="status">Esta viagem não está disponível para a quantidade de passageiros escolhida.</p>;

  return <MapaDaViagem viagem={viagem} />;
}
