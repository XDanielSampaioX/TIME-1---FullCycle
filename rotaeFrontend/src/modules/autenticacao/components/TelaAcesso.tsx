import type { ReactNode } from "react";
import { PainelBoasVindas, type PainelBoasVindasProps } from "./PainelBoasVindas";

type TelaAcessoProps = {
  painel: PainelBoasVindasProps;
  titulo: string;
  subtitulo: string;
  children: ReactNode;
};

// Telas de acesso (login e cadastro): painel verde de um lado e o formulário do outro, como no protótipo.
export function TelaAcesso({ painel, titulo, subtitulo, children }: TelaAcessoProps) {
  return (
    <main className="grid flex-1 grid-rows-[auto_1fr] md:grid-cols-2 md:grid-rows-1">
      <PainelBoasVindas {...painel} />
      <section className="grid place-items-center px-4 py-10">
        <div className="grid w-full max-w-sm gap-6">
          <header className="grid gap-1">
            <h1 className="m-0 text-2xl font-extrabold">{titulo}</h1>
            <p className="m-0 text-sm text-(--color-text-secondary)">{subtitulo}</p>
          </header>
          {children}
        </div>
      </section>
    </main>
  );
}
