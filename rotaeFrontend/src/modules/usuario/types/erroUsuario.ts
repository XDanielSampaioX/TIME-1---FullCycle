export type ErroUsuario =
  | { tipo: "validacao"; mensagem: string }
  | { tipo: "autenticacao"; mensagem: string }
  | { tipo: "servidor"; mensagem: string };