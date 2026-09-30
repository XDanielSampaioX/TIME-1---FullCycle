import { ConsultaViagensPage } from "@/modules/viagem/pages/ConsultaViagensPage";
import { obterBuscaViagem } from "@/modules/viagem/utils/obterBuscaViagem";

export default async function ViagensPage({ searchParams }: PageProps<"/viagens">) {
  const busca = obterBuscaViagem(await searchParams);

  return <ConsultaViagensPage busca={busca} />;
}
