import Link from "next/link";
import { ListaReservas } from "@/modules/reserva/components/ListaReservas";
import { ReservaProvider } from "@/modules/reserva/contexts/ReservaContext";

export function ConsultaReservasPage() {
  return (
    <ReservaProvider>
      <main className="reserva-page">
        <section className="reserva-content">
          <header className="reserva-intro">
            <div>
              <h1>Minhas viagens</h1>
              <p>Acompanhe suas reservas, pagamentos e bilhetes em um só lugar.</p>
            </div>
            <Link className="reserva-new-trip" href="/viagens">＋ Encontrar nova viagem</Link>
          </header>
          <ListaReservas />
        </section>
      </main>
    </ReservaProvider>
  );
}
