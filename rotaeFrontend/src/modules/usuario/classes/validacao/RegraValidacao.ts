import type { ErrosValidacao } from "../../types/errosValidacao";

// Composite (contrato comum): uma regra sozinha e um grupo de regras são validados do mesmo jeito.
export abstract class RegraValidacao<Dados extends Record<string, string>> {
  abstract validar(dados: Dados): ErrosValidacao<Dados>;

  protected erro(campo: keyof Dados, mensagem: string) {
    return { [campo]: mensagem } as ErrosValidacao<Dados>;
  }
}
