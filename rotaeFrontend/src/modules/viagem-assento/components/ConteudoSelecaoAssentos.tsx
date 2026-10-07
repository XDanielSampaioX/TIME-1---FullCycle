"use client";

import { useEffect, useState } from "react";
import { buscarViagem } from "@/modules/viagem/services/buscarViagem";
import { consultarViagensDisponiveis } from "@/modules/viagem/utils/consultarViagensDisponiveis";
import type { BuscaViagem } from "@/modules/viagem/types/buscaViagem";
import type { ViagemDisponivel } from "@/modules/viagem/types/viagemDisponivel";
import { Button } from "@/shared/components/Button";
import { SelecaoAssentos } from "./SelecaoAssentos";

export function ConteudoSelecaoAssentos({ viagemId, busca }: { viagemId: number; busca: BuscaViagem }) {
  const [versao, setVersao] = useState(0);
  const [estado, setEstado] = useState<{
    viagemId: number;
    passageiros?: number;
    versao: number;
    viagem: ViagemDisponivel | null;
    carregando: boolean;
    erro: string | null;
  }>(() => ({ viagemId, passageiros: busca.passageiros, versao, viagem: null, carregando: true, erro: null }));

  useEffect(() => {
    let ativo = true;

    buscarViagem(viagemId)
      .then((resultado) => {
        if (!ativo) return;
        const viagem = resultado
          ? consultarViagensDisponiveis([resultado], {
            origem: "",
            destino: "",
            partida: "",
            passageiros: busca.passageiros ?? 1,
          })[0] ?? null
          : null;
        setEstado({ viagemId, passageiros: busca.passageiros, versao, viagem, carregando: false, erro: null });
      })
      .catch(() => {
        if (ativo) setEstado({
          viagemId,
          passageiros: busca.passageiros,
          versao,
          viagem: null,
          carregando: false,
          erro: "Não foi possível carregar os dados da viagem.",
        });
      });

    return () => {
      ativo = false;
    };
  }, [viagemId, busca.passageiros, versao]);

  const carregando = estado.carregando
    || estado.viagemId !== viagemId
    || estado.passageiros !== busca.passageiros
    || estado.versao !== versao;

  if (carregando) return <p className="viagem-estado" role="status">Carregando poltronas…</p>;
  if (estado.erro) {
    return (
      <div className="viagem-estado" role="alert">
        <p>{estado.erro}</p>
        <Button onClick={() => setVersao((atual) => atual + 1)}>Tentar novamente</Button>
      </div>
    );
  }
  if (!estado.viagem) return <p className="viagem-estado" role="status">Esta viagem não está disponível para a quantidade de passageiros escolhida.</p>;

  return <SelecaoAssentos viagem={estado.viagem} />;
}
