"use client";

import { useState } from "react";
import { listarViagensAssentos } from "../services/listarViagensAssentos";
import type { ViagemAssento } from "../types/viagemAssento";

export function useSelecaoAssentos(viagemId: number, quantidade: number, disponiveis: ViagemAssento[]) {
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [confirmada, setConfirmada] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function alternar(assentoId: number) {
    if (verificando || !disponiveis.some((item) => item.assentoId === assentoId && item.status === "DISPONIVEL")) return;
    setConfirmada(false);
    setErro(null);
    setSelecionados((atuais) => atuais.includes(assentoId)
      ? atuais.filter((id) => id !== assentoId)
      : atuais.length < quantidade ? [...atuais, assentoId] : atuais);
  }

  async function confirmar() {
    if (selecionados.length !== quantidade || verificando) return false;
    setVerificando(true);
    setErro(null);

    try {
      const atuais = await listarViagensAssentos();
      const livres = selecionados.filter((id) => atuais.some((item) => item.viagemId === viagemId && item.assentoId === id && item.status === "DISPONIVEL"));

      if (livres.length !== quantidade) {
        setSelecionados(livres);
        setConfirmada(false);
        setErro("Um dos assentos ficou indisponível. Atualize o mapa e escolha outra poltrona.");
        return false;
      }

      setConfirmada(true);
      return true;
    } catch {
      setErro("Não foi possível verificar os assentos. Tente novamente.");
      return false;
    } finally {
      setVerificando(false);
    }
  }

  return { selecionados, alternar, confirmar, confirmada, verificando, erro };
}
