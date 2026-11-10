import { fetchAutenticado } from "@/modules/autenticacao/services/fetchAutenticado";
import { buscarReserva } from "../../services/buscarReserva";
import { cadastrarPassageiros } from "../../services/cadastrarPassageiros";
import { cancelarReserva } from "../../services/cancelarReserva";
import { criarReserva } from "../../services/criarReserva";
import { listarMinhasReservas } from "../../services/listarMinhasReservas";

jest.mock("@/modules/autenticacao/services/fetchAutenticado");

function resposta(status: number, corpo: unknown = {}) {
  return { status, ok: status >= 200 && status < 300, json: async () => corpo } as Response;
}

const passageiro = { nome: "Ana", cpf: "529.982.247-25", dataNasc: "1995-04-20", celular: "(85) 99999-0000", email: "ana@email.com" };

describe("serviços de reserva", () => {
  beforeEach(() => jest.resetAllMocks());

  it("buscarReserva traz a reserva com os passageiros", async () => {
    jest.mocked(fetchAutenticado).mockResolvedValue(resposta(200, { id: 9, passageiros: [] }));

    await expect(buscarReserva(9)).resolves.toEqual({ id: 9, passageiros: [] });
    expect(fetchAutenticado).toHaveBeenCalledWith(expect.stringContaining("/api/v1/reservas/9/"));
  });

  it("buscarReserva avisa quando o backend não devolve a reserva", async () => {
    jest.mocked(fetchAutenticado).mockResolvedValue(resposta(404, { detail: "Não encontrado." }));

    await expect(buscarReserva(9)).rejects.toThrow("Não foi possível carregar os detalhes da reserva.");
  });

  it("criarReserva envia os ids dos assentos da viagem", async () => {
    jest.mocked(fetchAutenticado).mockResolvedValue(resposta(201, { id: 1 }));

    await expect(criarReserva(7, [45])).resolves.toEqual({ id: 1 });
    expect(fetchAutenticado).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/reservas/"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ viagemId: 7, viagemAssentoIds: [45] }),
      }),
    );
  });

  it("criarReserva devolve as poltronas ocupadas no 409", async () => {
    jest.mocked(fetchAutenticado).mockResolvedValue(resposta(409, { detail: "Ocupado", assentos: [45] }));

    await expect(criarReserva(7, [45, 46])).resolves.toEqual([45]);
  });

  it("criarReserva repassa a recusa do backend quando o 409 não traz poltronas", async () => {
    jest.mocked(fetchAutenticado).mockResolvedValue(resposta(409, { detail: "Viagem encerrada", assentos: [] }));

    await expect(criarReserva(7, [45])).rejects.toThrow("Viagem encerrada");
  });

  it("cancelarReserva repassa a recusa do backend", async () => {
    jest.mocked(fetchAutenticado).mockResolvedValue(resposta(400, { detail: "Reserva não pode ser cancelada (status: PAGO)." }));

    await expect(cancelarReserva(9)).rejects.toThrow("Reserva não pode ser cancelada (status: PAGO).");
    expect(fetchAutenticado).toHaveBeenCalledWith(expect.stringContaining("/api/v1/reservas/9/cancelar/"), { method: "POST" });
  });

  it("cancelarReserva aceita keepalive para quando a página está fechando", async () => {
    jest.mocked(fetchAutenticado).mockResolvedValue(resposta(200, { id: 9 }));

    await cancelarReserva(9, { keepalive: true });

    expect(fetchAutenticado).toHaveBeenCalledWith(expect.any(String), { method: "POST", keepalive: true });
  });

  it("cadastrarPassageiros envia CPF e celular só com números", async () => {
    jest.mocked(fetchAutenticado).mockResolvedValue(resposta(201, []));

    await expect(cadastrarPassageiros(9, [passageiro])).resolves.toBeNull();
    expect(fetchAutenticado).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/reservas/9/passageiros/"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify([{ ...passageiro, cpf: "52998224725", celular: "85999990000" }]),
      }),
    );
  });

  it("cadastrarPassageiros marca o campo recusado no passageiro certo", async () => {
    jest.mocked(fetchAutenticado).mockResolvedValue(resposta(400, {
      "1": { cpf: ["CPF inválido.", "Outra mensagem"] },
      "2": { cpf: ["CPF inválido."], email: ["Informe um e-mail válido."] },
    }));

    await expect(cadastrarPassageiros(9, [passageiro, passageiro, passageiro])).resolves.toEqual([
      {},
      { cpf: "CPF inválido." },
      { cpf: "CPF inválido.", email: "Informe um e-mail válido." },
    ]);
  });

  it("cadastrarPassageiros repassa as recusas da reserva e da lista inteira", async () => {
    jest.mocked(fetchAutenticado).mockResolvedValueOnce(resposta(409, { detail: "Reserva expirada." }));
    await expect(cadastrarPassageiros(9, [])).rejects.toThrow("Reserva expirada.");

    jest.mocked(fetchAutenticado).mockResolvedValueOnce(resposta(400, { nonFieldErrors: ["A lista contém CPFs duplicados."] }));
    await expect(cadastrarPassageiros(9, [])).rejects.toThrow("A lista contém CPFs duplicados.");
  });

  it("listarMinhasReservas percorre todas as páginas com a sessão do usuário", async () => {
    jest.mocked(fetchAutenticado)
      .mockResolvedValueOnce(resposta(200, { next: "http://backend:8000/api/v1/me/reservas/?page=2", results: [{ id: 1 }] }))
      .mockResolvedValueOnce(resposta(200, { next: null, results: [{ id: 2 }] }));

    await expect(listarMinhasReservas()).resolves.toEqual([{ id: 1 }, { id: 2 }]);
    expect(fetchAutenticado).toHaveBeenCalledTimes(2);
  });
});
