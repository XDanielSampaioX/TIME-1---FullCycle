import { notFound } from "next/navigation";
import { PagamentoReservaPage } from "@/modules/reserva/pages/PagamentoReservaPage";

export default async function PagamentoPage({ params }: PageProps<"/reservas/[id]/pagamento">) {
  const { id } = await params;
  const reservaId = Number(id);

  if (!Number.isSafeInteger(reservaId) || reservaId < 1) notFound();

  return <PagamentoReservaPage reservaId={reservaId} />;
}
