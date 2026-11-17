import { formatarDataHora } from "@/shared/utils/formatarDataHora";
import { formatarCodigoReserva, formatarHorariosDaViagem, formatarPoltronas } from "../../utils/formatarReserva";
import { bilheteEmitido, descreverStatusReserva, obterStatusAtualReserva, separarReservas } from "../../utils/regrasReserva";
import { criarReservaFalsa } from "../fixtures/reserva";

const agora = new Date("2026-11-03T12:00:00-03:00");

describe("regras de reserva", () => {
  it("formata o código a partir do ano de criação e do id", () => {
    expect(formatarCodigoReserva({ id: 87, criadoEm: "2026-11-03T10:00:00-03:00" })).toBe("#ROT-2026-0087");
  });

  it("formata o prazo restante", () => {
    const prazo = (expiraEm: string) => descreverStatusReserva(criarReservaFalsa({ expiraEm }), agora).descricao;

    expect(prazo("2026-11-03T12:12:00-03:00")).toBe("Conclua em até 12 min para garantir os assentos");
    expect(prazo("2026-11-04T10:00:00-03:00")).toBe("Conclua em até 22h para garantir os assentos");
    expect(prazo("2026-11-03T13:30:00-03:00")).toBe("Conclua em até 1h 30min para garantir os assentos");
  });

  it("trata como expirada a reserva pendente com prazo vencido", () => {
    const vencida = criarReservaFalsa({ expiraEm: "2026-11-03T11:59:00-03:00" });

    expect(obterStatusAtualReserva(criarReservaFalsa(), agora)).toBe("PAGAMENTO_PENDENTE");
    expect(obterStatusAtualReserva(vencida, agora)).toBe("EXPIRADO");
    expect(descreverStatusReserva(vencida, agora).titulo).toBe("Prazo expirado");
  });

  it("mostra a data do cancelamento", () => {
    const reserva = criarReservaFalsa({ status: "CANCELADO", atualizadoEm: "2026-08-22T09:00:00-03:00" });

    expect(descreverStatusReserva(reserva, agora).descricao).toBe(`Cancelada por você em ${formatarDataHora("2026-08-22T09:00:00-03:00")}`);
  });

  it("mostra as poltronas pelo número do backend e um traço quando não há nenhuma", () => {
    expect(formatarPoltronas(criarReservaFalsa().assentos)).toBe("45, 46");
    expect(formatarPoltronas([])).toBe("—");
  });

  it("separa próximas e histórico dos últimos 90 dias", () => {
    const pendente = criarReservaFalsa({ id: 1 });
    const paga = criarReservaFalsa({ id: 2, status: "PAGO" });
    const cancelada = criarReservaFalsa({ id: 3, status: "CANCELADO" });
    const realizada = criarReservaFalsa({
      id: 4,
      status: "PAGO",
      viagem: { ...pendente.viagem, partidaEm: "2026-10-01T10:00:00-03:00" },
    });
    const antiga = criarReservaFalsa({
      id: 5,
      status: "CANCELADO",
      viagem: { ...pendente.viagem, partidaEm: "2026-01-01T10:00:00-03:00" },
    });

    const { proximas, historico } = separarReservas([pendente, paga, cancelada, realizada, antiga], agora);

    expect(proximas.map((reserva) => reserva.id)).toEqual([1, 2]);
    expect(historico.map((reserva) => reserva.id)).toEqual([3, 4]);
  });

  it("emite o bilhete da reserva paga e, enquanto o pagamento é pulado, da pendente com passageiros", () => {
    const passageiro = { id: 1, usuarioId: null, nome: "Ana", email: "", celular: "", dataNasc: "", cpf: "", criadoEm: "", atualizadoEm: "" };
    const pendente = criarReservaFalsa();

    expect(bilheteEmitido({ ...pendente, status: "PAGO", passageiros: [] }, agora)).toBe(true);
    expect(bilheteEmitido({ ...pendente, passageiros: [passageiro] }, agora)).toBe(true);
    expect(bilheteEmitido({ ...pendente, passageiros: [] }, agora)).toBe(false);
    expect(bilheteEmitido({ ...pendente, passageiros: [passageiro] }, new Date("2026-11-05T12:00:00-03:00"))).toBe(false);
    expect(bilheteEmitido({ ...pendente, status: "CANCELADO", passageiros: [passageiro] }, agora)).toBe(false);
  });

  it("formata os horários e avisa quando a chegada é no dia seguinte", () => {
    expect(formatarHorariosDaViagem(criarReservaFalsa().viagem)).toBe("22:30 ➔ 04:50 (+1 dia)");
  });
});
