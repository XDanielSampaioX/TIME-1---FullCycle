export type ApresentacaoStatusReserva = {
  classe: "pendente" | "confirmada" | "expirada" | "falha" | "cancelada";
  titulo: string;
  descricao: string;
  acaoPrincipal?: "PAGAR" | "BILHETES" | "TENTAR_NOVAMENTE" | "BUSCAR_NOVAMENTE";
};
