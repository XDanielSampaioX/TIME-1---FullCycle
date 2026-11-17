import Link from "next/link";

type RodapeAcessoProps = {
  pergunta: string;
  link: { texto: string; href: string };
  // Ex.: "Ao entrar" ou "Ao criar sua conta".
  acao: string;
};

// Fim das telas de acesso: o link para a outra tela (login ou cadastro) e o aviso dos termos, como no protótipo.
export function RodapeAcesso({ pergunta, link, acao }: RodapeAcessoProps) {
  return (
    <>
      <p className={`
        m-0 flex items-center gap-3 text-xs text-(--color-text-muted)
        before:h-px before:flex-1 before:bg-(--color-border) after:h-px after:flex-1 after:bg-(--color-border)
      `}>
        ou
      </p>
      <p className="m-0 text-center text-sm text-(--color-text-secondary)">
        {pergunta}{" "}
        <Link className="font-bold text-(--color-brand-800)" href={link.href}>
          {link.texto}
        </Link>
      </p>
      <p className="m-0 text-center text-xs text-(--color-text-muted)">
        {acao}, você concorda com nossos Termos de Uso e Política de Privacidade.
      </p>
    </>
  );
}
