import type { Cidade } from "@/modules/cidade/types/cidade";
import type { Reserva } from "../types/reserva";

// Exemplo: #ROT-2026-0087. O QR Code de cada passagem guarda este código com a poltrona (#ROT-2026-0087-45).
export function formatarCodigoReserva({ id, criadoEm }: Pick<Reserva, "id" | "criadoEm">) {
  return `#ROT-${criadoEm.slice(0, 4)}-${String(id).padStart(4, "0")}`;
}

// Exemplo: São Paulo (SP).
export function formatarCidade({ nome, uf }: Pick<Cidade, "nome" | "uf">) {
  return `${nome} (${uf})`;
}

// Exemplo: Mariana, Pedro e Ana.
export function formatarNomesPassageiros(passageiros: string[]) {
  const nomes = [...passageiros];
  const ultimo = nomes.pop() ?? "";

  return nomes.length ? `${nomes.join(", ")} e ${ultimo}` : ultimo;
}

// Exemplo: Executiva.
export function formatarClasse({ classe }: Pick<Reserva["viagem"], "classe">) {
  if (classe === "EXECUTIVA") return "Executiva";
  if (classe === "CONVENCIONAL") return "Convencional";
  return "Classe não informada";
}

// Exemplo: sex., 18 de dez. (o meio-dia evita que o fuso troque o dia).
export function formatarDiaDaViagem({ partidaEm }: Pick<Reserva["viagem"], "partidaEm">) {
  return new Date(`${partidaEm.slice(0, 10)}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" });
}

// Exemplo: 22:30 ➔ 04:50 (+1 dia). Usa a hora local da viagem, como vem do backend.
export function formatarHorariosDaViagem({ partidaEm, chegadaEm }: Pick<Reserva["viagem"], "partidaEm" | "chegadaEm">) {
  const outroDia = chegadaEm.slice(0, 10) !== partidaEm.slice(0, 10) ? " (+1 dia)" : "";
  return `${partidaEm.slice(11, 16)} ➔ ${chegadaEm.slice(11, 16)}${outroDia}`;
}

// Exemplo: 123.456.789-09 vira 12345678909. O backend guarda CPF e celular só com números.
export function apenasDigitos(valor: string) {
  return valor.replace(/\D/g, "");
}

// Exemplo: 45, 46. Ao cancelar, o backend desvincula os assentos e a reserva volta sem nenhum.
export function formatarPoltronas(assentos: Reserva["assentos"]) {
  return assentos.map((assento) => assento.numero).join(", ") || "—";
}
