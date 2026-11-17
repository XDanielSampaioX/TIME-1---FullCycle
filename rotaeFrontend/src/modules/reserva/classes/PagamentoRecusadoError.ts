// O backend respondeu e recusou o pedido de pagamento (409, 404, 400). A mensagem é a do backend.
// Separa essa recusa das falhas sem resposta (rede, corpo ilegível), em que a tela consulta a reserva.
export class PagamentoRecusadoError extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "PagamentoRecusadoError";
  }
}
