"use client";

import { useViagem } from "@/modules/viagem/contexts/ViagemContext";
import { CardViagem } from "@/modules/viagem/components/CardViagem";

export function ListaViagens() {
  const { viagens, carregando, erro, recarregar } = useViagem();

  if (carregando) return <p role="status">Carregando viagens...</p>;
  if (erro) return <p role="alert">{erro}</p>;
  if (viagens.length === 0) return <p>Nenhuma viagem disponível no momento.</p>;

  return (
    <div className="viagem-lista">
      {viagens.map((viagem) => (
        <CardViagem key={viagem.id} viagem={viagem} />
      ))}
      <button type="button" onClick={() => void recarregar()}>Atualizar viagens</button>
    </div>
  );
}
