export type Usuario = {
  id?: number;
  nome: string;
  email: string;
  senhaHash: string;
  celular?: string;
  dataNasc?: string;
  cpf?: string;
  criadoEm?: string;
  atualizadoEm?: string;
};
