"use client";

import { useState } from "react";
import { useViagem } from "../hooks/useViagem";
import type { BuscaViagem } from "../types/buscaViagem";
import { Button } from "@/shared/components/Button";

export function ResumoBuscaViagem({ busca }: { busca: BuscaViagem }) {
  const { cidades } = useViagem();
  const [editando, setEditando] = useState(false);
  const nomeCidade = (valor: string, vazio: string) => {
    const cidade = cidades.find((item) => String(item.id) === valor);
    return cidade ? `${cidade.nome} (${cidade.uf})` : valor || vazio;
  };
  const data = new Date(`${busca.partida}T12:00:00`);
  const dataExibida = !busca.partida ? "Todas as datas"
    : Number.isNaN(data.getTime()) ? "Data inválida"
      : data.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <section className="viagem-busca" aria-label="Sua busca">
      <div className="viagem-busca-resumo">
        <div className="viagem-criterios">
          <strong>{nomeCidade(busca.origem, "Todas as origens")}</strong>
          <span className="viagem-seta" aria-hidden="true">➜</span>
          <strong>{nomeCidade(busca.destino, "Todos os destinos")}</strong>
          <span className="viagem-criterio-extra">{dataExibida}</span>
          <span className="viagem-criterio-extra">
            {busca.passageiros
              ? `${busca.passageiros} ${busca.passageiros === 1 ? "passageiro" : "passageiros"}`
              : "Quantidade definida na seleção de assentos"}
          </span>
        </div>
        <button className="viagem-editar" type="button" aria-expanded={editando} aria-controls="editar-busca" onClick={() => setEditando(!editando)}>
          {editando ? "Fechar edição" : "Editar busca"}
        </button>
      </div>
      {editando && (
        <form id="editar-busca" className="viagem-formulario" action="/viagens">
          <label>
            Origem
            <input name="origem" list="cidades-busca" defaultValue={nomeCidade(busca.origem, "")} placeholder="Todas as origens" />
          </label>
          <label>
            Destino
            <input name="destino" list="cidades-busca" defaultValue={nomeCidade(busca.destino, "")} placeholder="Todos os destinos" />
          </label>
          <datalist id="cidades-busca">
            {cidades.map((cidade) => (
              <option key={cidade.id} value={`${cidade.nome} (${cidade.uf})`} />
            ))}
          </datalist>
          <label>
            Ida
            <input name="partida" type="date" defaultValue={busca.partida} />
          </label>
          <label>
            Passageiros
            <select name="passageiros" defaultValue={busca.passageiros ?? ""}>
              <option value="">Definir na seleção de assentos</option>
              {[1, 2, 3, 4].map((quantidade) => (
                <option key={quantidade} value={quantidade}>{quantidade}</option>
              ))}
            </select>
          </label>
          <Button type="submit">Buscar viagens</Button>
        </form>
      )}
    </section>
  );
}
