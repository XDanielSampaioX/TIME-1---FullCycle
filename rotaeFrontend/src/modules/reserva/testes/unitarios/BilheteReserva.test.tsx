import { render, screen } from "@testing-library/react";
import { BilheteReserva } from "../../components/BilheteReserva";
import type { ReservaDetalhe } from "../../types/reservaDetalhe";
import { criarReservaFalsa } from "../fixtures/reserva";

const passageiro = { id: 1, usuarioId: null, nome: "Mariana Oliveira", email: "", celular: "", dataNasc: "", cpf: "", criadoEm: "", atualizadoEm: "" };

function reservaComPassageiros(passageiros: ReservaDetalhe["passageiros"]): ReservaDetalhe {
  return { ...criarReservaFalsa({ id: 4921 }), passageiros, passagens: [] };
}

describe("BilheteReserva", () => {
  it("mostra um bloco único com todos os passageiros e poltronas", () => {
    render(
      <BilheteReserva reserva={reservaComPassageiros([passageiro, { ...passageiro, id: 2, nome: "Pedro Souza" }])} />,
    );

    expect(screen.getAllByRole("region", { name: "Detalhes da reserva" })).toHaveLength(1);
    expect(screen.getByText("DETALHES DA RESERVA")).toBeInTheDocument();
    expect(screen.getByText("Mariana Oliveira e Pedro Souza")).toBeInTheDocument();
    expect(screen.getByText("45, 46")).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /QR Code/ })).not.toBeInTheDocument();
  });

  it("avisa quando a reserva ainda não tem passageiros", () => {
    render(<BilheteReserva reserva={reservaComPassageiros([])} />);

    expect(screen.getByText("Não informados")).toBeInTheDocument();
  });
});
