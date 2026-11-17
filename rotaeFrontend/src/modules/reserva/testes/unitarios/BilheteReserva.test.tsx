import { render, screen, within } from "@testing-library/react";
import { BilheteReserva } from "../../components/BilheteReserva";
import type { ReservaDetalhe } from "../../types/reservaDetalhe";
import { criarReservaFalsa } from "../fixtures/reserva";

const passageiro = { id: 1, usuarioId: null, nome: "Mariana Oliveira", email: "", celular: "", dataNasc: "", cpf: "", criadoEm: "", atualizadoEm: "" };

function reservaPaga(id: number): ReservaDetalhe {
  return { ...criarReservaFalsa({ id, status: "PAGO" }), passageiros: [] };
}

function desenhoDoQrCode(id: number, poltrona = 45) {
  const { unmount } = render(<BilheteReserva reserva={reservaPaga(id)} emitido />);
  const desenho = screen.getByRole("img", { name: `QR Code da passagem #ROT-2026-${id}-${poltrona}` }).innerHTML;
  unmount();
  return desenho;
}

describe("BilheteReserva", () => {
  it("gera um QR Code diferente para cada reserva", () => {
    expect(desenhoDoQrCode(4921)).not.toBe(desenhoDoQrCode(4602));
  });

  it("gera um QR Code diferente para cada passagem da mesma reserva", () => {
    expect(desenhoDoQrCode(4921, 45)).not.toBe(desenhoDoQrCode(4921, 46));
  });

  it("mostra um bilhete por passageiro, com a menor poltrona para o primeiro", () => {
    render(
      <BilheteReserva
        reserva={{
          ...reservaPaga(4921),
          assentos: [{ id: 46, numero: 46, status: "RESERVADO" }, { id: 45, numero: 45, status: "RESERVADO" }],
          passageiros: [passageiro, { ...passageiro, id: 2, nome: "Pedro Souza" }],
        }}
        emitido
      />,
    );

    const [primeira, segunda] = screen.getAllByRole("region", { name: /^Passagem/ });
    expect(within(primeira).getByText("Mariana Oliveira")).toBeInTheDocument();
    expect(within(primeira).getByText("45")).toBeInTheDocument();
    expect(within(segunda).getByText("Pedro Souza")).toBeInTheDocument();
    expect(within(segunda).getByText("46")).toBeInTheDocument();
    // O valor total da reserva é dividido entre as passagens.
    expect(within(primeira).getByText(/124,00/)).toBeInTheDocument();
  });

  it("gera sempre o mesmo QR Code para a mesma reserva", () => {
    expect(desenhoDoQrCode(4921)).toBe(desenhoDoQrCode(4921));
  });

  it("só mostra o QR Code quando o bilhete foi emitido", () => {
    render(<BilheteReserva reserva={reservaPaga(4921)} emitido={false} />);

    expect(screen.queryByRole("img", { name: /QR Code/ })).not.toBeInTheDocument();
  });
});
