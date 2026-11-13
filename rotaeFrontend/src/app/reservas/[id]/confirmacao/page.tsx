import { notFound } from "next/navigation";
import { ConfirmacaoReservaPage } from "@/modules/reserva/pages/ConfirmacaoReservaPage";

export default async function ConfirmacaoPage({ params }: PageProps<"/reservas/[id]/confirmacao">) {
  const { id } = await params;
  const reservaId = Number(id);

  if (!Number.isSafeInteger(reservaId) || reservaId < 1) notFound();

  return <ConfirmacaoReservaPage reservaId={reservaId} />;
}
