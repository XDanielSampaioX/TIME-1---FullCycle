import type { ReactNode } from "react";

export type PaginacaoProps = {
  resumo: ReactNode;
  anterior: string | null;
  proxima: string | null;
  carregando?: boolean;
  onNavegar: (url: string) => void;
};

export type Pagina<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
