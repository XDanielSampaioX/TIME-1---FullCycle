import { render, screen } from "@testing-library/react";
import { EtapaConfirmacao } from "../../components/EtapaConfirmacao";
import { buscarReserva } from "../../services/buscarReserva";
import { criarReservaFalsa } from "../fixtures/reserva";

jest.mock("../../services/buscarReserva");

const passageiro = { id: 1, usuarioId: 3, nome: "Mariana Oliveira", email: "", celular: "", dataNasc: "", cpf: "", criadoEm: "", atualizadoEm: "" };

describe("EtapaConfirmacao", () => {
  beforeEach(() => jest.resetAllMocks());

  it("mostra o quadro de confirmação do Figma depois dos passageiros", async () => {
    jest.mocked(buscarReserva).mockResolvedValue({
      ...criarReservaFalsa({ expiraEm: "2099-01-01T10:00:00-03:00" }),
      passageiros: [passageiro],
    });
    render(<EtapaConfirmacao reservaId={5087} />);

    expect(await screen.findByRole("heading", { level: 1, name: "Reserva confirmada!" })).toBeInTheDocument();
    expect(screen.getByText("BILHETE DIGITAL EMITIDO")).toBeInTheDocument();
    expect(screen.getByText("Mariana Oliveira")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "QR Code da reserva #ROT-2026-5087" })).toBeInTheDocument();
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
});
