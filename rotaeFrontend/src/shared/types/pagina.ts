import type { ReactNode } from "react";

export type PaginacaoProps = {
  resumo: ReactNode;
  anterior: string | null;
  proxima: string | null;
  carregando?: boolean;
  rotulo?: string;
  // Classe extra para quem precisa de outro visual, como o carrossel de passagens.
  className?: string;
  onNavegar: (url: string) => void;
};

export type Pagina<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
