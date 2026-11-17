"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { PagamentoRecusadoError } from "../classes/PagamentoRecusadoError";
import { buscarReserva } from "../services/buscarReserva";
import { pagarReserva } from "../services/pagarReserva";
import type { EtapaDoPagamento } from "../types/etapaDoPagamento";
import type { MetodoPagamento } from "../types/metodoPagamento";

// Quando a resposta não diz como a reserva ficou, só buscando de novo para saber:
// no 502 o backend conta a tentativa como recusada (a terceira encerra a reserva), e numa
// falha de rede o pagamento pode ter sido aprovado antes de a conexão cair.
async function consultarStatus(reservaId: number) {
  const reserva = await buscarReserva(reservaId).catch(() => null);
  return reserva?.status ?? null;
}

// Envia o pagamento e guarda em que ponto a tela está. Aprovado, segue para a confirmação.
// aoReservaMudar: a reserva foi cancelada ou expirou em outra aba; a tela busca de novo e mostra o aviso.
export function usePagamento(reservaId: number, aoReservaMudar: () => void) {
  const router = useRouter();
  const [metodo, setMetodo] = useState<MetodoPagamento>("PIX");
  const [etapa, setEtapa] = useState<EtapaDoPagamento>("escolhendo");
  const [erro, setErro] = useState<string | null>(null);
  // Na terceira recusa o backend marca a reserva como FALHA e libera as poltronas.
  const [reservaFalhou, setReservaFalhou] = useState(false);
  // Evita um segundo POST enquanto o primeiro não volta: o backend recusaria com 409.
  const enviando = useRef(false);

  async function pagar() {
    if (enviando.current) return;
    enviando.current = true;
    setEtapa("processando");
    setErro(null);

    try {
      const pagamento = await pagarReserva(reservaId, metodo);

      if (pagamento?.status === "APROVADO") {
        // A tela segue "processando" até a navegação terminar.
        router.push(`/reservas/${reservaId}/confirmacao`);
        return;
      }

      setReservaFalhou((pagamento?.reservaStatus ?? await consultarStatus(reservaId)) === "FALHA");
      setEtapa("negado");
    } catch (motivo) {
      // Recusa do backend (409), rede caída ou resposta ilegível: em todos os casos a reserva
      // pode ter mudado (paga ou cancelada em outra aba), então a tela pergunta a ela.
      const status = await consultarStatus(reservaId);

      if (status === "PAGO") {
        router.push(`/reservas/${reservaId}/confirmacao`);
        return;
      }

      if (status === "FALHA") {
        setReservaFalhou(true);
        setEtapa("negado");
      } else if (status && status !== "PAGAMENTO_PENDENTE") {
        setEtapa("escolhendo");
        aoReservaMudar();
      } else {
        // Ainda pendente (ex.: outro pagamento em andamento) ou sem resposta: fica no formulário com o aviso.
        setErro(motivo instanceof PagamentoRecusadoError ? motivo.message : "Não foi possível falar com o servidor. Tente novamente.");
        setEtapa("escolhendo");
      }
    }
    enviando.current = false;
  }

  return { metodo, setMetodo, etapa, erro, reservaFalhou, pagar, tentarNovamente: () => setEtapa("escolhendo") };
}
