import styles from "../styles/EtapasCheckout.module.css";

const etapasPadrao = [
  "Seleção de assentos",
  "Dados dos passageiros",
  "Pagamento",
  "Confirmação",
];

export function EtapasCheckout({ atual, etapas = etapasPadrao }: {
  atual: number;
  etapas?: string[];
}) {
  return (
    <nav aria-label="Etapas do checkout">
      <ol className={styles.etapas}>
        {etapas.map((titulo, indice) => {
          const numero = indice + 1;

          return (
            <li key={`${numero}-${titulo}`} aria-current={numero === atual ? "step" : undefined}>
              <span>{numero}</span>
              {titulo}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
