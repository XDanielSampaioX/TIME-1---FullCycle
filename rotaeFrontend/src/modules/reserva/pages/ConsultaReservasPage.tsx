import { ListaReservas } from "@/modules/reserva/components/ListaReservas";
import { ReservaProvider } from "@/modules/reserva/contexts/ReservaContext";

export function ConsultaReservasPage() {
  return (
    <ReservaProvider>
      <main className="reserva-page">
        <section className="reserva-content">
          <p className="usuario-eyebrow">Rotaê</p>
          <h1>Minhas reservas</h1>
          <p>Consulte o status das suas reservas e cancele quando necessário.</p>
          <ListaReservas />
        </section>
      </main>
    </ReservaProvider>
  );
}
