import Image from "next/image";

const ETAPAS = ["Assento", "Passageiro", "Pagamento", "Confirmação"];

export function EtapasCheckout({ atual }: { atual: number }) {
  return (
    <ol className="checkout-etapas" aria-label="Etapas da compra">
      {ETAPAS.map((etapa, indice) => (
        <li key={etapa} aria-current={indice + 1 === atual ? "step" : undefined} data-concluida={indice + 1 < atual || undefined}>
          <span>{indice + 1 < atual ? "✓" : indice + 1}</span>
          {etapa}
          {indice < ETAPAS.length - 1 && <Image src="/viagens/etapa.svg" width={40} height={2} alt="" />}
        </li>
      ))}
    </ol>
  );
}
