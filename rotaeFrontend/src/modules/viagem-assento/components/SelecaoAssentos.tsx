"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/components/Button";
import { listarViagensAssentos } from "../services/listarViagensAssentos";
import type { ViagemAssento } from "../types/viagemAssento";
import type { ViagemDisponivel } from "@/modules/viagem/types/viagemDisponivel";
import { MapaAssentos } from "./MapaAssentos";
import { ResumoSelecaoAssentos } from "./ResumoSelecaoAssentos";
import { useSelecaoAssentos } from "../hooks/useSelecaoAssentos";

export function SelecaoAssentos({ viagem }: { viagem: ViagemDisponivel }) {
  const [versao, setVersao] = useState(0);
  const [estado, setEstado] = useState<{
    viagemId: number;
    versao: number;
    assentos: ViagemAssento[];
    erro: string | null;
  }>(() => ({ viagemId: viagem.id, versao, assentos: [], erro: null }));

  useEffect(() => {
    let ativo = true;

    listarViagensAssentos(viagem.id)
      .then((resposta) => {
        if (ativo) setEstado({ viagemId: viagem.id, versao, assentos: resposta, erro: null });
      })
      .catch(() => {
        if (ativo) setEstado({ viagemId: viagem.id, versao, assentos: [], erro: "Não foi possível carregar os assentos desta viagem." });
      });

    return () => {
      ativo = false;
    };
  }, [viagem.id, versao]);

  const carregando = estado.viagemId !== viagem.id || estado.versao !== versao;
  const assentos = carregando ? [] : estado.assentos;
  const selecao = useSelecaoAssentos(viagem.id, assentos);

  if (carregando) return <p className="viagem-estado" role="status">Carregando assentos…</p>;
  if (estado.erro) {
    return (
      <div className="viagem-estado" role="alert">
        <p>{estado.erro}</p>
        <Button onClick={() => setVersao((atual) => atual + 1)}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <>
      <div className="assento-conteudo">
        <MapaAssentos assentos={assentos} {...selecao} />
        <ResumoSelecaoAssentos resultado={viagem} assentos={assentos} selecao={selecao} />
      </div>
      <button className="assento-atualizar" type="button" onClick={() => setVersao((atual) => atual + 1)}>Atualizar disponibilidade</button>
    </>
  );
}
