export function IconeUsuario({ className = "" }: { className?: string }) {
  return (
    <svg className={`fill-none stroke-current stroke-[1.8] ${className}`.trim()} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5.5 20c.7-3.2 2.8-5 6.5-5s5.8 1.8 6.5 5" />
    </svg>
  );
}
