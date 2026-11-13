import type { CadastroUsuario } from "@/modules/usuario/types/cadastroUsuario";

// Um item do POST /reservas/{id}/passageiros/: os mesmos dados do cadastro de usuário, sem a senha.
export type DadosPassageiro = Omit<CadastroUsuario, "senha">;
