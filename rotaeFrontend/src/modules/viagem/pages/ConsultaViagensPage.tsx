import { ListaViagens } from "@/modules/viagem/components/ListaViagens";
import { ViagemProvider } from "@/modules/viagem/contexts/ViagemContext";

export function ConsultaViagensPage() {
  return (
    <ViagemProvider>
      <main className="viagem-page">
        <section className="viagem-content">
          <p className="usuario-eyebrow">Rotaê</p>
          <h1>Viagens disponíveis</h1>
          <p>Consulte horários e valores para escolher sua próxima viagem.</p>
          <ListaViagens />
        </section>
      </main>
    </ViagemProvider>
  );
}
