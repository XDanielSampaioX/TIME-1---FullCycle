import type { ReactNode } from "react";
import { Brand } from "@/shared/components/Header";

type PainelBoasVindasProps = {
  selo: string;
  titulo: ReactNode;
  texto: string;
};

// Painel verde das telas de acesso (login e, depois, cadastro), como no protótipo.
export function PainelBoasVindas({ selo, titulo, texto }: PainelBoasVindasProps) {
  return (
    <aside className="flex flex-col gap-12 bg-(--color-brand-950) p-6 text-(--color-text-on-dark) md:p-12">
      <Brand />
      <div className="grid gap-5 max-md:hidden">
        <span className={`
          w-fit rounded-(--radius-pill) bg-(--color-accent-500) px-3 py-1 text-[0.65rem]
          font-extrabold tracking-wide text-(--color-brand-950) uppercase
        `}>
          {selo}
        </span>
        <p className="m-0 text-4xl leading-tight font-extrabold lg:text-5xl">{titulo}</p>
        <p className="m-0 max-w-md text-sm text-(--color-text-on-dark)/80">{texto}</p>
      </div>
      <div className={`
        mt-auto flex min-h-40 items-end overflow-hidden rounded-(--radius-lg)
        bg-[linear-gradient(0deg,rgb(13_46_38/90%),rgb(13_46_38/20%)),url(/hero-onibus.jpg)]
        bg-cover bg-center p-5 max-md:hidden
      `}>
        <p className="m-0 grid gap-1 text-sm">
          <strong>Viaje com segurança</strong>
          <span className="text-xs text-(--color-text-on-dark)/80">
            Planeje sua viagem com tranquilidade e conte com informações claras em cada etapa.
          </span>
        </p>
      </div>
    </aside>
  );
}
