import Link from "next/link";
import { Container } from "./Container";

export function Header() {
  return (
    <header className={`
      absolute top-0 z-10 w-full
      bg-(--color-brand-950) text-(--color-text-on-dark)
    `}>
      <Container>
        <nav className={`
            flex min-h-[3.2rem] items-center justify-between
            border-b border-white/20
          `}
          aria-label="Navegação principal"
        >
          <Link className={`
              flex items-center gap-2 text-2xl
              font-extrabold no-underline
            `}
            href="/"
          >
            <span className={`
                grid size-8 place-items-center rounded-sm
                bg-(--color-accent-500) text-(--color-brand-950)
              `}
              aria-hidden="true"
            >
              <svg className={`
                  size-5 fill-none stroke-current stroke-[1.7]
                `}
                viewBox="0 0 24 24"
                role="img"
              >
                <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3h9A2.5 2.5 0 0 1 19 5.5V17H5V5.5Z" />
                <path d="M7.5 7h9M7 11h10M8 17v2m8-2v2M7.5 14h.01M16.5 14h.01" />
              </svg>
            </span>
            <span>rotaê</span>
          </Link>
          <div className={`
            flex gap-8 text-xs max-[800px]:hidden
          `}>
            <Link className="no-underline"
              href="/#buscar"
            >
              Encontrar viagem
            </Link>
            <Link className="no-underline"
              href="/#como-funciona"
            >
              Como funciona
            </Link>
            <Link className="no-underline"
              href="/#seguranca"
            >
              Segurança
            </Link>
          </div>
          <Link className={`
              text-xs no-underline max-[560px]:rounded-full
              max-[560px]:px-3 max-[560px]:py-2
            `}
            href="/reservas"
          >
            Minhas viagens
          </Link>
        </nav>
      </Container>
    </header>
  );
}
