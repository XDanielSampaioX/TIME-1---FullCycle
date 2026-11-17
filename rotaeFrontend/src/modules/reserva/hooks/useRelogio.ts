"use client";

import { useEffect, useState } from "react";

// A hora atual, atualizada a cada segundo. Serve para a contagem do prazo da reserva.
export function useRelogio() {
  const [agora, setAgora] = useState(() => new Date());

  useEffect(() => {
    const intervalo = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(intervalo);
  }, []);

  return agora;
}
