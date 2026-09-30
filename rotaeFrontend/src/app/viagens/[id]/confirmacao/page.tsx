import { notFound } from "next/navigation";
import { ViagemProvider } from "@/modules/viagem/contexts/ViagemContext";
import { ConfirmacaoPage } from "@/modules/confirmacao/pages/ConfirmacaoPage";

export default async function ConfirmacaoRotaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const viagemId = Number(id);

  if (!Number.isSafeInteger(viagemId) || viagemId < 1) notFound();

  return <ViagemProvider><ConfirmacaoPage viagemId={viagemId} /></ViagemProvider>;
}
