"use client";

import Link from "next/link";
import { useCarregarDados } from "../hooks/useCarregarDados";
import { buscarReserva } from "../services/buscarReserva";
import { descreverStatusReserva } from "../utils/regrasReserva";
import { AvisoDeErro } from "./AvisoDeErro";
import { FormularioPassageiros } from "./FormularioPassageiros";

// A hora da resposta é a referência para saber se o prazo da reserva já acabou.
async function buscarComHorario(reservaId: number) {
  return { reserva: await buscarReserva(reservaId), agora: new Date() };
}

function AvisoSemFormulario({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <div className="viagem-vazia" role="status">
      <h2>{titulo}</h2>
      <p>{descricao}</p>
      <Link className="viagem-selecionar" href="/minhas-viagens">Ver minhas viagens</Link>
    </div>
  );
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

  if (reserva.passageiros.length) {
    return <AvisoSemFormulario titulo="Passageiros já informados" descricao="Os passageiros desta reserva já foram cadastrados." />;
  }

  if (statusAtual !== "PAGAMENTO_PENDENTE") return <AvisoSemFormulario titulo={titulo} descricao={descricao} />;

  return <FormularioPassageiros reserva={reserva} />;
}
