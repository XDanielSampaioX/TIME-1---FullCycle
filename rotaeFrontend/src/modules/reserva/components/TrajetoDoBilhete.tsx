// A linha entre origem e destino, com um ônibus percorrendo o trajeto. É só ilustração.
export function TrajetoDoBilhete() {
  return (
    <span className="reserva-bilhete-trajeto" aria-hidden="true">
      <svg viewBox="0 0 32 20" width="32" height="20" fill="none">
        <rect x="1" y="2" width="28" height="13" rx="3" fill="currentColor" />
        <rect x="4" y="5" width="6" height="4" rx="1" fill="#fff" />
        <rect x="12" y="5" width="6" height="4" rx="1" fill="#fff" />
        <rect x="20" y="5" width="7" height="5" rx="1" fill="#fff" />
        <circle cx="8" cy="16" r="2.5" fill="currentColor" stroke="#fff" strokeWidth="1.5" />
        <circle cx="23" cy="16" r="2.5" fill="currentColor" stroke="#fff" strokeWidth="1.5" />
      </svg>
    </span>
  );
}
