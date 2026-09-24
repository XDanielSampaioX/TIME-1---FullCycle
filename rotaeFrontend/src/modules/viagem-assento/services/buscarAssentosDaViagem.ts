import { listarViagensAssentos } from "@/modules/viagem-assento/services/listarViagensAssentos";
import type { ViagemAssento } from "@/modules/viagem-assento/types/viagemAssento";

export async function buscarAssentosDaViagem(viagemId: number): Promise<ViagemAssento[]> {
  const assentos = await listarViagensAssentos();
  return assentos.filter((assento) => assento.viagemId === viagemId);
}
