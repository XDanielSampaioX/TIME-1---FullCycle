export type Usuario = {
  id: number;
  nome: string;
  email: string;
  celular: string; // blank=True no backend: vem "" e nunca null
  dataNasc: string | null; // null=True no backend: contas criadas pelo admin não têm data
  cpf: string;
  criadoEm: string;
  atualizadoEm: string;
};
