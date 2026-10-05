"use client";

import { Button } from "./Button";
import type { PaginacaoProps } from "@/shared/types/paginacaoProps";
import styles from "../styles/Paginacao.module.css";

export function Paginacao({ resumo, anterior, proxima, carregando = false, onNavegar }: PaginacaoProps) {
  if (!anterior && !proxima) return null;

  return (
    <nav className={styles.paginacao} aria-label="Paginação dos resultados">
      <span aria-live="polite">{resumo}</span>
      <div className={styles.controles}>
        <Button variant="secondary" disabled={!anterior || carregando} onClick={() => anterior && onNavegar(anterior)}>
          Anterior
        </Button>
        <Button variant="secondary" disabled={!proxima || carregando} onClick={() => proxima && onNavegar(proxima)}>
          Próxima
        </Button>
      </div>
    </nav>
  );
}
