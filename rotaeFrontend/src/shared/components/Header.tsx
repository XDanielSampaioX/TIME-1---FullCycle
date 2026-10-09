import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "./Container";
import { AccountMenu } from "./AccountMenu";

type HeaderActionContext = { className?: string };

abstract class HeaderAction {
  abstract get key(): string;
  abstract render(context?: HeaderActionContext): ReactNode;
}

class HeaderLinkAction extends HeaderAction {
  constructor(private readonly label: string, private readonly href: string) {
    super();
  }

  get key() {
    return this.href;
  }

  render({ className = "" }: HeaderActionContext = {}) {
    return (
      <Link className={`no-underline ${className}`.trim()} href={this.href}>
        {this.label}
      </Link>
    );
  }
}

class AccountMenuAction extends HeaderAction {
  get key() {
    return "account-menu";
  }

  render() {
    return <AccountMenu />;
  }
}

const navigationActions: HeaderAction[] = [
  new HeaderLinkAction("Encontrar viagem", "/#buscar"),
  new HeaderLinkAction("Como funciona", "/#como-funciona"),
  new HeaderLinkAction("Segurança", "/#seguranca"),
];
const accountAction = new AccountMenuAction();

function Brand() {
  return (
    <Link className="flex items-center gap-2 text-2xl font-extrabold no-underline" href="/">
      <span className="grid size-8 place-items-center rounded-sm bg-(--color-accent-500) text-(--color-brand-950)" aria-hidden="true">
        <svg className="size-5 fill-none stroke-current stroke-[1.7]" viewBox="0 0 24 24" role="img">
          <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3h9A2.5 2.5 0 0 1 19 5.5V17H5V5.5Z" />
          <path d="M7.5 7h9M7 11h10M8 17v2m8-2v2M7.5 14h.01M16.5 14h.01" />
        </svg>
      </span>
      <span>rotaê</span>
    </Link>
  );
}

function Header() {
  return (
    <header className="relative z-10 w-full bg-(--color-brand-950) text-(--color-text-on-dark)">
      <Container>
        <nav className="flex min-h-4.5rem items-center justify-between border-b border-white/20" aria-label="Navegação principal">
          <Brand />
          <div className="flex gap-8 text-xs max-[800px]:hidden">
            {navigationActions.map((action) => <span key={action.key} className="contents">{action.render()}</span>)}
          </div>
          {accountAction.render()}
        </nav>
      </Container>
    </header>
  );
}

export { Header };
