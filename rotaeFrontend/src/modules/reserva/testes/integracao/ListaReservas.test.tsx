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

function montar(reservas: Reserva[]) {
  const aoAtualizar = jest.fn();
  render(<ListaReservas reservas={reservas} agora={agora} aoAtualizar={aoAtualizar} />);
  return { aoAtualizar };
}

describe("ListaReservas", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(buscarReserva).mockResolvedValue({ ...criarReservaFalsa(), passageiros: [passageiro] });
    HTMLDialogElement.prototype.showModal = jest.fn(function mostrar(this: HTMLDialogElement) {
      this.open = true;
    });
    HTMLDialogElement.prototype.close = jest.fn();
  });

  it("mostra os dados do Figma a partir do contrato do backend", async () => {
    montar([criarReservaFalsa()]);

    const card = screen.getByRole("article", { name: "Reserva #ROT-2026-5087" });
    expect(within(card).getByText("Aguardando pagamento")).toBeInTheDocument();
    expect(within(card).getByText("São Paulo (SP)")).toBeInTheDocument();
    expect(within(card).getByText(formatarDataHora("2026-12-18T22:30:00-03:00"))).toBeInTheDocument();
    expect(within(card).getByText("45, 46")).toBeInTheDocument();
    expect(await within(card).findByText("Mariana Oliveira")).toBeInTheDocument();
  });

  it("pula o pagamento e mostra o bilhete da confirmação na reserva pendente com passageiros", async () => {
    montar([criarReservaFalsa()]);
    const card = screen.getByRole("article", { name: "Reserva #ROT-2026-5087" });
    await within(card).findByText("Mariana Oliveira");

    // O cartão continua com o status do backend; o detalhe é o mesmo da tela de confirmação.
    expect(within(card).getByText("Aguardando pagamento")).toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: "Pagar agora" })).not.toBeInTheDocument();
    fireEvent.click(within(card).getByRole("button", { name: "Ver 2 bilhetes" }));

    expect(await screen.findByRole("heading", { name: "Reserva confirmada!", hidden: true })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "QR Code da reserva #ROT-2026-5087", hidden: true })).toBeInTheDocument();
    expect(screen.getByText("VALOR TOTAL")).toBeInTheDocument();
  });

  it("leva para os passageiros a reserva pendente que ainda não tem nenhum", async () => {
    jest.mocked(buscarReserva).mockResolvedValue({ ...criarReservaFalsa(), passageiros: [] });
    montar([criarReservaFalsa()]);

    expect(await screen.findByRole("link", { name: "Informar passageiros" })).toHaveAttribute("href", "/reservas/5087/passageiros");
    expect(screen.queryByRole("button", { name: "Pagar agora" })).not.toBeInTheDocument();
  });

  it("pede confirmação antes de cancelar e atualiza a lista", async () => {
    jest.mocked(cancelarReserva).mockResolvedValue(criarReservaFalsa({ status: "CANCELADO" }));
    const { aoAtualizar } = montar([criarReservaFalsa()]);
    await screen.findByText("Mariana Oliveira");

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(cancelarReserva).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Sim, cancelar" }));

    await waitFor(() => expect(aoAtualizar).toHaveBeenCalled());
    expect(cancelarReserva).toHaveBeenCalledWith(5087);
  });

  it("exibe a recusa do backend ao cancelar", async () => {
    jest.mocked(cancelarReserva).mockRejectedValue(new Error("Reserva não pode ser cancelada (status: PAGO)."));
    const { aoAtualizar } = montar([criarReservaFalsa()]);
    await screen.findByText("Mariana Oliveira");

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    fireEvent.click(screen.getByRole("button", { name: "Sim, cancelar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Reserva não pode ser cancelada (status: PAGO).");
    expect(aoAtualizar).not.toHaveBeenCalled();
  });

  it("mostra as ações do Figma para cada situação", async () => {
    montar([
      criarReservaFalsa({ id: 1, status: "PAGO" }),
      criarReservaFalsa({ id: 2, status: "EXPIRADO" }),
      criarReservaFalsa({ id: 3, status: "FALHA" }),
      criarReservaFalsa({ id: 4, status: "CANCELADO", assentos: [], totalAssentos: 0 }),
    ]);

    const [paga, expirada, falha, cancelada] = screen.getAllByRole("article");
    expect(within(paga).getByRole("button", { name: "Ver 2 bilhetes" })).toBeInTheDocument();
    expect(within(expirada).getByRole("link", { name: "Buscar novamente" })).toHaveAttribute("href", "/viagens?origem=1&destino=2");
    expect(within(falha).getByRole("link", { name: "Tentar de novo" })).toHaveAttribute("href", "/viagens/7/assentos");
    expect(within(cancelada).getByRole("button", { name: "Ver detalhes" })).toBeInTheDocument();
    expect(within(cancelada).getByText("—")).toBeInTheDocument();
    await waitFor(() => expect(buscarReserva).toHaveBeenCalledTimes(4));
  });

  it("filtra e conta as reservas", async () => {
    montar([criarReservaFalsa({ id: 1 }), criarReservaFalsa({ id: 2, status: "CANCELADO" })]);
    await screen.findAllByText("Mariana Oliveira");

    expect(screen.getByRole("button", { name: "Todas 2" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Histórico 1" }));

    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.queryByRole("heading", { name: "Próximas viagens" })).not.toBeInTheDocument();
  });

  it("pagina de cinco em cinco e só busca passageiros das reservas visíveis", async () => {
    montar(Array.from({ length: 6 }, (_, indice) => criarReservaFalsa({ id: indice + 1 })));

    await waitFor(() => expect(buscarReserva).toHaveBeenCalledTimes(5));
    expect(screen.getAllByRole("article")).toHaveLength(5);

    fireEvent.click(screen.getByRole("button", { name: "Próxima" }));

    expect(screen.getAllByRole("article")).toHaveLength(1);
    await waitFor(() => expect(buscarReserva).toHaveBeenCalledTimes(6));
  });

  it("volta para a última página quando a atual deixa de existir", async () => {
    const seis = Array.from({ length: 6 }, (_, indice) => criarReservaFalsa({ id: indice + 1 }));
    const { rerender } = render(<ListaReservas reservas={seis} agora={agora} aoAtualizar={jest.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Próxima" }));
    expect(screen.getAllByRole("article")).toHaveLength(1);

    rerender(<ListaReservas reservas={seis.slice(0, 5)} agora={agora} aoAtualizar={jest.fn()} />);

    expect(screen.getAllByRole("article")).toHaveLength(5);
    await screen.findAllByText("Mariana Oliveira");
  });

  it("abre o modal com os detalhes da reserva", async () => {
    jest.mocked(buscarReserva).mockResolvedValue({ ...criarReservaFalsa({ status: "PAGO" }), passageiros: [passageiro] });
    montar([criarReservaFalsa({ status: "PAGO" })]);
    await screen.findByText("Mariana Oliveira");

    fireEvent.click(screen.getByRole("button", { name: "Detalhes" }));

    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    expect(await screen.findByRole("heading", { name: "Reserva confirmada!", hidden: true })).toBeInTheDocument();
    expect(screen.getByText("BILHETE DIGITAL EMITIDO")).toBeInTheDocument();
    expect(screen.getByText("VALOR PAGO")).toBeInTheDocument();
  });
});
