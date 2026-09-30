import { interpretarSessaoCheckout, type SessaoCheckout } from "../types/sessaoCheckout";

const CHAVE_SESSAO_CHECKOUT = "rotae:checkout";
const EVENTO_SESSAO_CHECKOUT = "rotae:checkout-alterado";

export function obterSessaoCheckoutSerializada() {
  return sessionStorage.getItem(CHAVE_SESSAO_CHECKOUT);
}

export function obterSessaoCheckout() {
  return interpretarSessaoCheckout(obterSessaoCheckoutSerializada());
}

export function salvarSessaoCheckout(sessao: SessaoCheckout) {
  sessionStorage.setItem(CHAVE_SESSAO_CHECKOUT, JSON.stringify(sessao));
  window.dispatchEvent(new Event(EVENTO_SESSAO_CHECKOUT));
}

export function observarSessaoCheckout(atualizar: () => void) {
  window.addEventListener("storage", atualizar);
  window.addEventListener(EVENTO_SESSAO_CHECKOUT, atualizar);

  return () => {
    window.removeEventListener("storage", atualizar);
    window.removeEventListener(EVENTO_SESSAO_CHECKOUT, atualizar);
  };
}
