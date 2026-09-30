import { notFound } from "next/navigation";
import { ViagemProvider } from "@/modules/viagem/contexts/ViagemContext";
import { PagamentoPage } from "@/modules/pagamento/pages/PagamentoPage";

export default async function PagamentoRotaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const viagemId = Number(id);

  if (!Number.isSafeInteger(viagemId) || viagemId < 1) notFound();

  return <ViagemProvider><PagamentoPage viagemId={viagemId} /></ViagemProvider>;
}
