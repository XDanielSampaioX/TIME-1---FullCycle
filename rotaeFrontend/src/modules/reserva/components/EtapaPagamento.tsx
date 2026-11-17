"use client";

import { useCarregarDados } from "../hooks/useCarregarDados";
import { usePagamento } from "../hooks/usePagamento";
import { useRelogio } from "../hooks/useRelogio";
import { buscarReserva } from "../services/buscarReserva";
import { descreverStatusReserva } from "../utils/regrasReserva";
import { AvisoDeErro } from "./AvisoDeErro";
import { AvisoSemFormulario } from "./AvisoSemFormulario";
import { FormularioPagamento } from "./FormularioPagamento";
import { ResultadoPagamento } from "./ResultadoPagamento";

// Busca a reserva e só abre o pagamento se o backend ainda aceitar: pendente, dentro do prazo
// e com os passageiros cadastrados. O relógio troca a tela sozinho quando o prazo acaba,
// mas não no meio de um pagamento: a resposta do backend é que decide o que mostrar.
export function EtapaPagamento({ reservaId }: { reservaId: number }) {
  const agora = useRelogio();
  const { dados: reserva, erro, carregando, recarregar } = useCarregarDados(
    buscarReserva,
    reservaId,
    "Não foi possível carregar a reserva.",
  );
  const pagamento = usePagamento(reservaId, recarregar);

  if (carregando) return <p className="viagem-estado" role="status">Carregando reserva…</p>;
  if (erro || !reserva) return <AvisoDeErro mensagem={erro ?? "Não foi possível carregar a reserva."} aoTentarNovamente={recarregar} />;
  if (pagamento.etapa !== "escolhendo") {
    return (
      <ResultadoPagamento
        reserva={reserva}
        negado={pagamento.etapa === "negado"}
        reservaFalhou={pagamento.reservaFalhou}
        aoTentarNovamente={pagamento.tentarNovamente}
      />
    );
  }

  const { statusAtual, titulo, descricao } = descreverStatusReserva(reserva, agora);

  if (statusAtual === "PAGO") {
    return (
      <AvisoSemFormulario
        titulo="Reserva já paga"
        descricao="O pagamento desta reserva já foi aprovado."
        destino={`/reservas/${reservaId}/confirmacao`}
        acao="Ver bilhete"
      />
    );
  }

  // O backend libera as poltronas da reserva em FALHA: não há o que pagar, só reservar de novo.
  if (statusAtual === "FALHA") {
    return (
      <AvisoSemFormulario
        titulo="Pagamento não aprovado"
        descricao="A reserva foi encerrada e as poltronas foram liberadas. Escolha as poltronas de novo."
        destino={`/viagens/${reserva.viagem.id}/assentos`}
        acao="Escolher poltronas"
      />
    );
  }

  if (statusAtual !== "PAGAMENTO_PENDENTE") return <AvisoSemFormulario titulo={titulo} descricao={descricao} />;

  if (!reserva.passageiros.length) {
    return (
      <AvisoSemFormulario
        titulo="Faltam os passageiros"
        descricao="Informe os passageiros de cada poltrona antes de pagar."
        destino={`/reservas/${reservaId}/passageiros`}
        acao="Informar passageiros"
      />
    );
  }

  return <FormularioPagamento reserva={reserva} agora={agora} pagamento={pagamento} />;
}
