"use client";

import { useViagem } from "@/modules/viagem/hooks/useViagem";
import type { ViagemDisponivel } from "@/modules/viagem/types/viagemDisponivel";
import { MapaAssentos } from "./MapaAssentos";
import { ResumoSelecaoAssentos } from "./ResumoSelecaoAssentos";
import { useSelecaoAssentos } from "../hooks/useSelecaoAssentos";

export function SelecaoAssentos({ resultado, quantidade }: { resultado: ViagemDisponivel; quantidade: number }) {
  const { assentos, assentosViagens, recarregar } = useViagem();
  const fisicos = assentos.filter((item) => item.onibusId === resultado.viagem.onibusId).sort((a, b) => a.numero - b.numero);
  const disponibilidades = assentosViagens.filter((item) => item.viagemId === resultado.viagem.id
    && fisicos.some((assento) => assento.id === item.assentoId));
  const selecao = useSelecaoAssentos(resultado.viagem.id!, quantidade, disponibilidades);

  return (
    <>
      <div className="assento-conteudo">
        <MapaAssentos assentos={fisicos} disponibilidades={disponibilidades} quantidade={quantidade} {...selecao} />
        <ResumoSelecaoAssentos resultado={resultado} assentos={fisicos} quantidade={quantidade} selecao={selecao} />
      </div>
      <button className="assento-atualizar" type="button" onClick={recarregar}>Atualizar disponibilidade</button>
    </>
  );
}
