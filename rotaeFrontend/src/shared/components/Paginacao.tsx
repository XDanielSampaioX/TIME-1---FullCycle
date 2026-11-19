"use client";

import styles from "../styles/Paginacao.module.css";
import { PaginacaoProps } from "../types/pagina";

// Uma linha: "‹ Anterior", o resumo no meio e "Próxima ›". Sem página para ir, o botão fica bloqueado.
// `className` acrescenta estilos de quem chama, sem perder o visual padrão.
export function Paginacao({ resumo, anterior, proxima, carregando = false, rotulo = "Paginação dos resultados", className, onNavegar }: PaginacaoProps) {
  if (!anterior && !proxima) return null;

  return (
    <nav className={[styles.paginacao, className].filter(Boolean).join(" ")} aria-label={rotulo}>
      <button type="button" className={styles.botao} disabled={!anterior || carregando} onClick={() => anterior && onNavegar(anterior)}>
        <span aria-hidden="true">‹</span>
        Anterior
      </button>
      <span className={styles.resumo} aria-live="polite">{resumo}</span>
      <button type="button" className={styles.botao} disabled={!proxima || carregando} onClick={() => proxima && onNavegar(proxima)}>
        Próxima
        <span aria-hidden="true">›</span>
      </button>
    </nav>
  );
}
