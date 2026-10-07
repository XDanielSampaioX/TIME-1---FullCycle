import type { ReactNode } from "react";

export type PaginacaoProps = {
  resumo: ReactNode;
  anterior: string | null;
  proxima: string | null;
  carregando?: boolean;
  onNavegar: (url: string) => void;
};
