import { SelecaoAssentosPage } from "@/modules/viagem-assento/pages/SelecaoAssentosPage";
import { obterBuscaViagem } from "@/modules/viagem/utils/obterBuscaViagem";
import { notFound } from "next/navigation";

export default async function AssentosPage({ params, searchParams }: PageProps<"/viagens/[id]/assentos">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const viagemId = Number(id);

  if (!Number.isSafeInteger(viagemId) || viagemId < 1) notFound();

  return <SelecaoAssentosPage viagemId={viagemId} busca={obterBuscaViagem(query)} />;
}
