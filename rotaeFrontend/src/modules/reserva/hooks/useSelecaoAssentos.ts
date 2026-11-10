"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAutenticacao } from "@/modules/autenticacao/hooks/useAutenticacao";
import type { ViagemAssento } from "@/modules/viagem-assento/types/viagemAssento";
import { cancelarReserva } from "../services/cancelarReserva";
import { criarReserva } from "../services/criarReserva";
import type { Reserva } from "../types/reserva";

// Limite de assentos por reserva definido pelo backend (ReservaCriarSerializer).
const LIMITE_DE_ASSENTOS = 10;

// A única forma de segurar uma poltrona no backend é criar uma reserva, e ela não aceita
// trocar assentos. Por isso a seleção é mantida como uma reserva que é refeita a cada clique.
// Devolve o mesmo formato do hook de viagem-assento, que é o que o mapa e o resumo de lá recebem.
export function useSelecaoAssentos(viagemId: number, assentos: ViagemAssento[], atualizarMapa: () => void) {
  const { estado } = useAutenticacao();
  const router = useRouter();
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [assentosEmTroca, setAssentosEmTroca] = useState<number[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const reservaAberta = useRef<Reserva | null>(null);

  const selecionados = assentosEmTroca ?? reserva?.assentos.map((assento) => assento.assentoId) ?? [];
  const verificando = assentosEmTroca !== null;

  function definirReserva(novaReserva: Reserva | null) {
    reservaAberta.current = novaReserva;
    setReserva(novaReserva);
  }

  // Sair da tela sem confirmar devolve as poltronas. Não cobre uma queda do navegador:
  // nesse caso a reserva fica em "Minhas viagens" até ser cancelada ou expirar no backend.
  useEffect(() => {
    function liberar() {
      const aberta = reservaAberta.current;
      if (!aberta) return;

      reservaAberta.current = null;
      setReserva(null);
      void cancelarReserva(aberta.id, { keepalive: true }).catch(() => undefined);
    }

    window.addEventListener("pagehide", liberar);
    return () => {
      window.removeEventListener("pagehide", liberar);
      liberar();
    };
  }, []);

  async function refazerReserva(assentoIds: number[]) {
    if (reservaAberta.current) {
      await cancelarReserva(reservaAberta.current.id);
      definirReserva(null);
    }

    // O mapa identifica a poltrona pelo assentoId; o backend espera o id dela nesta viagem.
    let restantes = assentos.filter((assento) => assentoIds.includes(assento.assentoId)).map((assento) => assento.id);

    while (restantes.length) {
      const resultado = await criarReserva(viagemId, restantes);

      if (!Array.isArray(resultado)) {
        definirReserva(resultado);
        return;
      }

      // O backend rejeita a reserva inteira: tenta de novo sem as poltronas perdidas.
      restantes = restantes.filter((id) => !resultado.includes(id));
      setErro("Outra pessoa acabou de escolher essa poltrona. Escolha outra.");
    }
  }

  async function alternar(assentoId: number) {
    if (verificando) return;

    if (estado !== "autenticado") {
      router.push("/login");
      return;
    }

    const selecionado = selecionados.includes(assentoId);

    if (!selecionado && selecionados.length >= LIMITE_DE_ASSENTOS) {
      setErro(`Você pode reservar até ${LIMITE_DE_ASSENTOS} poltronas.`);
      return;
    }

    const proximos = selecionado ? selecionados.filter((id) => id !== assentoId) : [...selecionados, assentoId];

    setAssentosEmTroca(proximos);
    setErro(null);

    try {
      await refazerReserva(proximos);
    } catch (motivo) {
      setErro(motivo instanceof Error ? motivo.message : "Não foi possível atualizar as poltronas. Tente novamente.");
    } finally {
      setAssentosEmTroca(null);
      atualizarMapa();
    }
  }

  // Daqui em diante a reserva é do usuário: sair da tela não pode mais cancelá-la.
  // A próxima etapa do checkout é informar os passageiros da reserva.
  // Devolve sempre false porque, ao receber true, o resumo de viagem-assento navegaria para um endereço vazio.
  async function confirmar() {
    if (reservaAberta.current && !verificando) {
      const { id } = reservaAberta.current;
      reservaAberta.current = null;
      router.push(`/reservas/${id}/passageiros`);
    }

    return false;
  }

  return { selecionados, alternar, confirmar, confirmada: false, verificando, erro };
}
