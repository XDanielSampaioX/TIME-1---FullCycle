import { ListaViagens } from "../components/ListaViagens";
import { ResumoBuscaViagem } from "../components/ResumoBuscaViagem";
import { ViagemProvider } from "../contexts/ViagemContext";
import type { BuscaViagem } from "../types/buscaViagem";
import "./viagens.css";

export function ConsultaViagensPage({ busca }: { busca: BuscaViagem }) {
  return (
    <ViagemProvider carregarViagensInicialmente={false}>
      <main className="viagem-page">
        <h1 className="sr-only">Viagens disponíveis</h1>
        <ResumoBuscaViagem busca={busca} />
        <ListaViagens key={JSON.stringify(busca)} busca={busca} />
      </main>
    </ViagemProvider>
  );
}
