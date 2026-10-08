import { ClasseViagem } from "./viagem";

export type FiltrosViagem = {
  periodos: number[];
  classes: ClasseViagem[];
  precoMinimo: number;
  precoMaximo: number;
};
