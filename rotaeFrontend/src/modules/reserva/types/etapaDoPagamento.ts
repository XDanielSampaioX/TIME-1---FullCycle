// escolhendo: abas de PIX e cartão. processando: o backend ainda não respondeu.
// negado: o backend recusou a tentativa ou o provedor falhou.
export type EtapaDoPagamento = "escolhendo" | "processando" | "negado";
