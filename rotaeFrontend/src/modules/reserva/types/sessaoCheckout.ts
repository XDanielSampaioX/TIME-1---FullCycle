import type { MetodoPagamento, StatusPagamento } from "@/modules/pagamento/types/pagamento";
import type { Passageiro } from "@/modules/passageiro/types/passageiro";

export type SessaoCheckout = {
  viagemId: number;
  assentoIds: number[];
  numerosAssentos: number[];
  passageiros: Passageiro[];
  metodoPagamento?: MetodoPagamento;
  statusPagamento?: StatusPagamento;
  codigoReserva?: string;
};

export function interpretarSessaoCheckout(valor: string | null): SessaoCheckout | null {
  if (!valor) return null;

  try {
    const dados: unknown = JSON.parse(valor);

    if (!dados || typeof dados !== "object") return null;
    const sessao = dados as Partial<SessaoCheckout>;

    if (!Number.isSafeInteger(sessao.viagemId) || !Array.isArray(sessao.assentoIds)
      || !Array.isArray(sessao.numerosAssentos) || !Array.isArray(sessao.passageiros)) return null;

    return sessao as SessaoCheckout;
  } catch {
    return null;
  }
}
