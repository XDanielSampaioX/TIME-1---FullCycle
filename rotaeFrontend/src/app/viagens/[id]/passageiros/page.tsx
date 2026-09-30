import { notFound } from "next/navigation";
import { ViagemProvider } from "@/modules/viagem/contexts/ViagemContext";
import { DadosPassageirosPage } from "@/modules/passageiro/pages/DadosPassageirosPage";

export default async function PassageirosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const viagemId = Number(id);

  if (!Number.isSafeInteger(viagemId) || viagemId < 1) notFound();

  return <ViagemProvider><DadosPassageirosPage viagemId={viagemId} /></ViagemProvider>;
}
