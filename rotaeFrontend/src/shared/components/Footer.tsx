export function Footer() {
  return (
    <footer className={`
      flex justify-between gap-4 bg-(--color-brand-950) px-4 py-8
      font-bold text-(--color-text-on-dark) min-[81rem]:px-[max(var(--page-gutter)
      calc((100%-var(--content-width))/2))] max-[560px]:grid
      `}>
      <span>✦ rotaê</span>
      <span>O caminho importa tanto quanto o destino.</span>
      <small>© 2026 Rotaê</small>
    </footer>
  );
}
