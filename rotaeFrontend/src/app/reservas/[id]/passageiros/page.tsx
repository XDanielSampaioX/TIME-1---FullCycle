import { notFound } from "next/navigation";
import { DadosPassageirosPage } from "@/modules/reserva/pages/DadosPassageirosPage";

export default async function PassageirosPage({ params }: PageProps<"/reservas/[id]/passageiros">) {
  const { id } = await params;
  const reservaId = Number(id);

  if (!Number.isSafeInteger(reservaId) || reservaId < 1) notFound();

  return <DadosPassageirosPage reservaId={reservaId} />;
}
