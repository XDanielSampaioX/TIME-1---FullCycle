import type { ValoresCadastro } from "./valoresCadastro";

export type ErrosCadastro = Partial<
  Record<keyof ValoresCadastro, string>
>;