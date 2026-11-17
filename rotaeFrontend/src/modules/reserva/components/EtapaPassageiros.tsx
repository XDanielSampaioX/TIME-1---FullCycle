"use client";

import { useCarregarDados } from "../hooks/useCarregarDados";
import { buscarReserva } from "../services/buscarReserva";
import { descreverStatusReserva } from "../utils/regrasReserva";
import { AvisoDeErro } from "./AvisoDeErro";
import { AvisoSemFormulario } from "./AvisoSemFormulario";
import { FormularioPassageiros } from "./FormularioPassageiros";

// A hora da resposta é a referência para saber se o prazo da reserva já acabou.
async function buscarComHorario(reservaId: number) {
  return { reserva: await buscarReserva(reservaId), agora: new Date() };
}

// Busca a reserva e só abre o formulário se o backend ainda aceitar passageiros nela:
// pagamento pendente, dentro do prazo e sem passageiros cadastrados.
export function EtapaPassageiros({ reservaId }: { reservaId: number }) {
  const { dados, erro, carregando, recarregar } = useCarregarDados(
    buscarComHorario,
    reservaId,
    "Não foi possível carregar a reserva.",
  );

  if (carregando) return <p className="viagem-estado" role="status">Carregando reserva…</p>;
  if (erro || !dados) return <AvisoDeErro mensagem={erro ?? "Não foi possível carregar a reserva."} aoTentarNovamente={recarregar} />;

  const { reserva, agora } = dados;
  const { statusAtual, titulo, descricao } = descreverStatusReserva(reserva, agora);

  // Quem volta do pagamento cai aqui. O link leva ao próximo passo de cada status;
  // nos demais (cancelada, expirada) fica o padrão, "Ver minhas viagens".
  if (reserva.passageiros.length) {
    const proximoPasso: Partial<Record<typeof statusAtual, { destino: string; acao: string }>> = {
      PAGAMENTO_PENDENTE: { destino: `/reservas/${reservaId}/pagamento`, acao: "Ir para o pagamento" },
      PAGO: { destino: `/reservas/${reservaId}/confirmacao`, acao: "Ver bilhete" },
      FALHA: { destino: `/viagens/${reserva.viagem.id}/assentos`, acao: "Escolher poltronas" },
    };
    return (
      <AvisoSemFormulario
        titulo="Passageiros já informados"
        descricao="Os passageiros desta reserva já foram cadastrados."
        {...proximoPasso[statusAtual]}
      />
    );
  }

  if (statusAtual !== "PAGAMENTO_PENDENTE") return <AvisoSemFormulario titulo={titulo} descricao={descricao} />;

  return <FormularioPassageiros reserva={reserva} />;
}
