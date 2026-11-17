import Link from "next/link";

// Aviso das etapas do checkout quando a reserva não aceita mais aquela etapa.
// Por padrão leva a "Minhas viagens"; `destino` e `acao` trocam o link.
export function AvisoSemFormulario({ titulo, descricao, destino = "/minhas-viagens", acao = "Ver minhas viagens" }: {
  titulo: string;
  descricao: string;
  destino?: string;
  acao?: string;
}) {
  return (
    <div className="viagem-vazia" role="status">
      <h2>{titulo}</h2>
      <p>{descricao}</p>
      <Link className="viagem-selecionar" href={destino}>{acao}</Link>
    </div>
  );
}
