"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAutenticacao } from "@/modules/autenticacao/hooks/useAutenticacao";
import type { ViagemAssento } from "@/modules/viagem-assento/types/viagemAssento";
import { criarReserva } from "../services/criarReserva";

// Limite de assentos por reserva definido pelo backend (ReservaCriarSerializer).
const LIMITE_DE_ASSENTOS = 10;

// Exemplo: ?assentos=101,102 vira [101, 102]. É como a seleção volta depois do login.
function lerAssentosDaUrl(valor: string | null) {
  return [...new Set((valor ?? "").split(",").map(Number).filter((id) => Number.isSafeInteger(id) && id > 0))];
}

// A seleção fica só na tela, guardando o id da poltrona nesta viagem (o que o POST /reservas/ espera).
// A reserva só é criada ao confirmar. Devolve o mesmo formato do hook de viagem-assento,
// que é o que o mapa e o resumo de lá recebem.
export function useSelecaoAssentos(viagemId: number, assentos: ViagemAssento[], atualizarMapa: () => void) {
  const { estado } = useAutenticacao();
  const router = useRouter();
  const parametros = useSearchParams();
  const [escolhidos, setSelecionados] = useState(() => lerAssentosDaUrl(parametros.get("assentos")));
  // Um endereço editado à mão pode trazer ids que não são desta viagem ou passar do limite:
  // eles ficariam presos na seleção, sem poltrona no mapa para desmarcar.
  const selecionados = escolhidos
    .filter((id) => assentos.some((assento) => assento.id === id))
    .slice(0, LIMITE_DE_ASSENTOS);
  const [verificando, setVerificando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function alternar(viagemAssentoId: number) {
    if (verificando) return;
    setErro(null);

    if (selecionados.includes(viagemAssentoId)) {
      setSelecionados(selecionados.filter((id) => id !== viagemAssentoId));
      return;
    }

    if (!assentos.some((assento) => assento.id === viagemAssentoId && assento.status === "DISPONIVEL")) return;

    if (selecionados.length >= LIMITE_DE_ASSENTOS) {
      setErro(`Você pode reservar até ${LIMITE_DE_ASSENTOS} poltronas.`);
      return;
    }

    setSelecionados([...selecionados, viagemAssentoId]);
  }

  // Quem não entrou vai para o login e volta para esta tela com as mesmas poltronas.
  function irParaLogin() {
    const busca = new URLSearchParams(window.location.search);
    busca.set("assentos", selecionados.join(","));
    router.push(`/login?${new URLSearchParams({ retorno: `${window.location.pathname}?${busca}` })}`);
  }

  // Cria a reserva com as poltronas escolhidas e segue para os passageiros.
  // Devolve sempre false porque, ao receber true, o resumo de viagem-assento navegaria para um endereço vazio.
  async function confirmar() {
    if (!selecionados.length || verificando || estado === "carregando") return false;

    if (estado !== "autenticado") {
      irParaLogin();
      return false;
    }

    setVerificando(true);
    setErro(null);

    try {
      const resultado = await criarReserva(viagemId, selecionados);

      // O botão continua desabilitado até a navegação terminar.
      if (!Array.isArray(resultado)) {
        router.push(`/reservas/${resultado.id}/passageiros`);
        return false;
      }

      // 409: o backend recusa a reserva inteira e informa as poltronas que já foram ocupadas.
      setSelecionados(selecionados.filter((id) => !resultado.includes(id)));
      setErro("Outra pessoa acabou de escolher uma das poltronas. Escolha outra.");
      atualizarMapa();
    } catch (motivo) {
      setErro(motivo instanceof Error ? motivo.message : "Não foi possível reservar as poltronas. Tente novamente.");
    }

    setVerificando(false);
    return false;
  }

  return { selecionados, alternar, confirmar, confirmada: false, verificando, erro };
}
