import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { formatarDataHora } from "@/shared/utils/formatarDataHora";
import { ListaReservas } from "../../components/ListaReservas";
import { buscarReserva } from "../../services/buscarReserva";
import { cancelarReserva } from "../../services/cancelarReserva";
import type { Reserva } from "../../types/reserva";
import { criarReservaFalsa } from "../fixtures/reserva";

jest.mock("../../services/buscarReserva");
jest.mock("../../services/cancelarReserva");

const agora = new Date("2026-11-03T12:00:00-03:00");
const passageiro = { id: 1, usuarioId: null, nome: "Mariana Oliveira", email: "", celular: "", dataNasc: "", cpf: "", criadoEm: "", atualizadoEm: "" };
const outroPassageiro = { ...passageiro, id: 2, nome: "Pedro Souza" };

// A listagem /me/reservas/ já traz o nome dos passageiros.
function reservaComPassageiro(dados: Partial<Reserva> = {}) {
  return criarReservaFalsa({ passageiros: ["Mariana Oliveira"], ...dados });
}

function montar(reservas: Reserva[]) {
  const aoAtualizar = jest.fn();
  render(<ListaReservas reservas={reservas} agora={agora} aoAtualizar={aoAtualizar} />);
  return { aoAtualizar };
}

describe("ListaReservas", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(buscarReserva).mockResolvedValue({ ...criarReservaFalsa(), passageiros: [passageiro, outroPassageiro] });
    HTMLDialogElement.prototype.showModal = jest.fn(function mostrar(this: HTMLDialogElement) {
      this.open = true;
    });
    HTMLDialogElement.prototype.close = jest.fn();
  });

  it("mostra os dados do Figma a partir do contrato do backend", () => {
    montar([reservaComPassageiro()]);

    const card = screen.getByRole("article", { name: "Reserva #ROT-2026-5087" });
    expect(within(card).getByText("Aguardando pagamento")).toBeInTheDocument();
    expect(within(card).getByText("São Paulo (SP)")).toBeInTheDocument();
    expect(within(card).getByText(formatarDataHora("2026-12-18T22:30:00-03:00"))).toBeInTheDocument();
    expect(within(card).getByText("45, 46")).toBeInTheDocument();
    expect(within(card).getByText("Mariana Oliveira")).toBeInTheDocument();
    // Os nomes vêm da listagem: nenhum detalhe é buscado para montar os cartões.
    expect(buscarReserva).not.toHaveBeenCalled();
  });

  it("pula o pagamento e mostra o bilhete da confirmação na reserva pendente com passageiros", async () => {
    montar([criarReservaFalsa({ passageiros: ["Mariana Oliveira", "Pedro Souza"] })]);
    const card = screen.getByRole("article", { name: "Reserva #ROT-2026-5087" });

    // O cartão continua com o status do backend; o detalhe é o mesmo da tela de confirmação.
    expect(within(card).getByText("Aguardando pagamento")).toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: "Pagar agora" })).not.toBeInTheDocument();
    fireEvent.click(within(card).getByRole("button", { name: "Ver 2 bilhetes" }));

    expect(await screen.findByRole("heading", { name: "Reserva confirmada!", hidden: true })).toBeInTheDocument();
    // Um bilhete por passageiro, cada um com a sua poltrona e o seu QR Code.
    expect(screen.getByRole("img", { name: "QR Code da passagem #ROT-2026-5087-45", hidden: true })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "QR Code da passagem #ROT-2026-5087-46", hidden: true })).toBeInTheDocument();
    expect(screen.getAllByText("VALOR")).toHaveLength(2);
  });

  it("leva para os passageiros a reserva pendente que ainda não tem nenhum", async () => {
    montar([criarReservaFalsa()]);

    expect(screen.getByRole("link", { name: "Informar passageiros" })).toHaveAttribute("href", "/reservas/5087/passageiros");
    expect(screen.queryByRole("button", { name: "Pagar agora" })).not.toBeInTheDocument();
  });

  it("pede confirmação antes de cancelar e atualiza a lista", async () => {
    jest.mocked(cancelarReserva).mockResolvedValue(criarReservaFalsa({ status: "CANCELADO" }));
    const { aoAtualizar } = montar([reservaComPassageiro()]);

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(cancelarReserva).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Sim, cancelar" }));

    await waitFor(() => expect(aoAtualizar).toHaveBeenCalled());
    expect(cancelarReserva).toHaveBeenCalledWith(5087);
  });

  it("exibe a recusa do backend ao cancelar", async () => {
    jest.mocked(cancelarReserva).mockRejectedValue(new Error("Reserva não pode ser cancelada (status: PAGO)."));
    const { aoAtualizar } = montar([reservaComPassageiro()]);

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    fireEvent.click(screen.getByRole("button", { name: "Sim, cancelar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Reserva não pode ser cancelada (status: PAGO).");
    expect(aoAtualizar).not.toHaveBeenCalled();
  });

  it("mostra as ações do Figma para cada situação", () => {
    montar([
      reservaComPassageiro({ id: 1, status: "PAGO" }),
      reservaComPassageiro({ id: 2, status: "EXPIRADO" }),
      reservaComPassageiro({ id: 3, status: "FALHA" }),
      reservaComPassageiro({ id: 4, status: "CANCELADO", assentos: [], totalAssentos: 0 }),
    ]);

    const [paga, expirada, falha, cancelada] = screen.getAllByRole("article");
    expect(within(paga).getByRole("button", { name: "Ver 2 bilhetes" })).toBeInTheDocument();
    expect(within(expirada).getByRole("link", { name: "Buscar novamente" })).toHaveAttribute("href", "/viagens?origem=1&destino=2");
    expect(within(falha).getByRole("link", { name: "Tentar de novo" })).toHaveAttribute("href", "/viagens/7/assentos");
    expect(within(cancelada).getByRole("button", { name: "Ver detalhes" })).toBeInTheDocument();
    expect(within(cancelada).getByText("—")).toBeInTheDocument();
  });

  it("filtra e conta as reservas", () => {
    montar([reservaComPassageiro({ id: 1 }), reservaComPassageiro({ id: 2, status: "CANCELADO" })]);

    expect(screen.getByRole("button", { name: "Todas 2" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Histórico 1" }));

    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.queryByRole("heading", { name: "Próximas viagens" })).not.toBeInTheDocument();
  });

  it("pagina de cinco em cinco", () => {
    montar(Array.from({ length: 6 }, (_, indice) => reservaComPassageiro({ id: indice + 1 })));

    expect(screen.getAllByRole("article")).toHaveLength(5);

    fireEvent.click(screen.getByRole("button", { name: "Próxima" }));

    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(buscarReserva).not.toHaveBeenCalled();
  });

  it("volta para a última página quando a atual deixa de existir", () => {
    const seis = Array.from({ length: 6 }, (_, indice) => reservaComPassageiro({ id: indice + 1 }));
    const { rerender } = render(<ListaReservas reservas={seis} agora={agora} aoAtualizar={jest.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Próxima" }));
    expect(screen.getAllByRole("article")).toHaveLength(1);

    rerender(<ListaReservas reservas={seis.slice(0, 5)} agora={agora} aoAtualizar={jest.fn()} />);

    expect(screen.getAllByRole("article")).toHaveLength(5);
  });

  it("abre o modal com os detalhes da reserva", async () => {
    jest.mocked(buscarReserva).mockResolvedValue({ ...criarReservaFalsa({ status: "PAGO" }), passageiros: [passageiro, outroPassageiro] });
    montar([reservaComPassageiro({ status: "PAGO" })]);

    fireEvent.click(screen.getByRole("button", { name: "Detalhes" }));

    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    expect(await screen.findByRole("heading", { name: "Reserva confirmada!", hidden: true })).toBeInTheDocument();
    expect(screen.getAllByText("BILHETE DIGITAL EMITIDO")).toHaveLength(2);
    expect(screen.getAllByText("VALOR PAGO")).toHaveLength(2);
  });
});
