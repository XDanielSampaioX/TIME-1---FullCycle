"use client";

import { useState } from "react";
import { Paginacao } from "@/shared/components/Paginacao";
import { useCarregarDados } from "../hooks/useCarregarDados";
import { buscarPassagem } from "../services/buscarPassagem";
import type { PassagemResumo } from "../types/passagemResumo";
import { AvisoDeErro } from "./AvisoDeErro";
import { BilhetePassagem } from "./BilhetePassagem";

const MENSAGEM_DE_ERRO = "Não foi possível carregar a passagem.";

// Carrega o bilhete de uma passagem. Quem usa troca o `key` a cada passagem para começar do zero.
function BilheteCarregado({ passagemId }: { passagemId: number }) {
  const { dados, erro, recarregar } = useCarregarDados(buscarPassagem, passagemId, MENSAGEM_DE_ERRO);

  if (erro) return <AvisoDeErro mensagem={erro} aoTentarNovamente={recarregar} />;
  if (!dados) return <p role="status">Carregando bilhete…</p>;
  return <BilhetePassagem passagem={dados} />;
}

// Mostra um bilhete por vez, com paginação entre as passagens da reserva.
export function CarrosselPassagens({ passagens: resumos }: { passagens: PassagemResumo[] }) {
  // O backend devolve da mais nova para a mais antiga, mas as passagens saem na ordem dos passageiros e poltronas.
  const passagens = [...resumos].sort((a, b) => a.id - b.id);
  const [indice, setIndice] = useState(0);

  if (!passagens.length) return <p role="status">Nenhuma passagem emitida para esta reserva.</p>;

  // Se a lista encolher, o índice escolhido pode deixar de existir.
  const atual = Math.min(indice, passagens.length - 1);

  return (
    <div className="reserva-bilhetes">
      <BilheteCarregado key={passagens[atual].id} passagemId={passagens[atual].id} />
      <Paginacao
        resumo={`Passagem ${atual + 1} de ${passagens.length}`}
        anterior={atual > 0 ? String(atual - 1) : null}
        proxima={atual < passagens.length - 1 ? String(atual + 1) : null}
        rotulo="Passagens da reserva"
        onNavegar={(destino) => setIndice(Number(destino))}
      />
    </div>
  );
}
