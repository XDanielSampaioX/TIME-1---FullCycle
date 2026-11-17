import { render, screen } from "@testing-library/react";
import { EtapaConfirmacao } from "../../components/EtapaConfirmacao";
import { buscarReserva } from "../../services/buscarReserva";
import { criarReservaFalsa } from "../fixtures/reserva";

jest.mock("../../services/buscarReserva");

const passageiro = { id: 1, usuarioId: 3, nome: "Mariana Oliveira", email: "", celular: "", dataNasc: "", cpf: "", criadoEm: "", atualizadoEm: "" };

describe("EtapaConfirmacao", () => {
  beforeEach(() => jest.resetAllMocks());

  it("mostra o quadro de confirmação do Figma depois do pagamento", async () => {
    jest.mocked(buscarReserva).mockResolvedValue({
      ...criarReservaFalsa({ expiraEm: "2099-01-01T10:00:00-03:00", status: "PAGO" }),
      passageiros: [passageiro, { ...passageiro, id: 2, usuarioId: null, nome: "Pedro Souza" }],
    });
    render(<EtapaConfirmacao reservaId={5087} />);

    expect(await screen.findByRole("heading", { level: 1, name: "Reserva confirmada!" })).toBeInTheDocument();
    expect(screen.getAllByText("BILHETE DIGITAL EMITIDO")).toHaveLength(2);
    expect(screen.getByText("Mariana Oliveira")).toBeInTheDocument();
    expect(screen.getByText("Pedro Souza")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "QR Code da passagem #ROT-2026-5087-45" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "QR Code da passagem #ROT-2026-5087-46" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver minhas viagens" })).toHaveAttribute("href", "/minhas-viagens");
    expect(screen.getByRole("link", { name: "Voltar ao início" })).toHaveAttribute("href", "/");
  });

  it("não emite o bilhete da reserva que ainda não tem passageiros", async () => {
    jest.mocked(buscarReserva).mockResolvedValue({
      ...criarReservaFalsa({ expiraEm: "2099-01-01T10:00:00-03:00" }),
      passageiros: [],
    });
    render(<EtapaConfirmacao reservaId={5087} />);

    expect(await screen.findByRole("heading", { level: 1, name: "Aguardando pagamento" })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /QR Code/ })).not.toBeInTheDocument();
  });

  it("leva ao pagamento quando a página é aberta com a reserva ainda pendente", async () => {
    jest.mocked(buscarReserva).mockResolvedValue({
      ...criarReservaFalsa({ expiraEm: "2099-01-01T10:00:00-03:00" }),
      passageiros: [passageiro],
    });
    render(<EtapaConfirmacao reservaId={5087} />);

    expect(await screen.findByRole("link", { name: "Ir para o pagamento" })).toHaveAttribute("href", "/reservas/5087/pagamento");
    expect(screen.queryByText("BILHETE DIGITAL EMITIDO")).not.toBeInTheDocument();
  });

  it("leva a reserva em FALHA a escolher as poltronas de novo", async () => {
    jest.mocked(buscarReserva).mockResolvedValue({ ...criarReservaFalsa({ status: "FALHA" }), passageiros: [passageiro] });
    render(<EtapaConfirmacao reservaId={5087} />);

    expect(await screen.findByRole("link", { name: "Escolher poltronas" })).toHaveAttribute("href", "/viagens/7/assentos");
  });
});
