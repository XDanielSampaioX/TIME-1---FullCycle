import type { ClasseViagem } from "./classeViagem";

export type FiltrosViagem = {
  periodos: number[];
  classes: ClasseViagem[];
  precoMinimo: number;
  precoMaximo: number;
};
