import { render, screen } from "@testing-library/react";
import { BilheteReserva } from "../../components/BilheteReserva";
import type { ReservaDetalhe } from "../../types/reservaDetalhe";
import { criarReservaFalsa } from "../fixtures/reserva";

function reservaPaga(id: number): ReservaDetalhe {
  return { ...criarReservaFalsa({ id, status: "PAGO" }), passageiros: [] };
}

function desenhoDoQrCode(id: number) {
  const { unmount } = render(<BilheteReserva reserva={reservaPaga(id)} emitido />);
  const desenho = screen.getByRole("img", { name: `QR Code da reserva #ROT-2026-${id}` }).innerHTML;
  unmount();
  return desenho;
}

describe("BilheteReserva", () => {
  it("gera um QR Code diferente para cada reserva", () => {
    expect(desenhoDoQrCode(4921)).not.toBe(desenhoDoQrCode(4602));
  });

  it("gera sempre o mesmo QR Code para a mesma reserva", () => {
    expect(desenhoDoQrCode(4921)).toBe(desenhoDoQrCode(4921));
  });

  it("só mostra o QR Code quando o bilhete foi emitido", () => {
    render(<BilheteReserva reserva={reservaPaga(4921)} emitido={false} />);

    expect(screen.queryByRole("img", { name: /QR Code/ })).not.toBeInTheDocument();
  });
});
