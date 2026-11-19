import { act, fireEvent, render, renderHook, screen, waitFor, within } from "@testing-library/react";
import { PagamentoRecusadoError } from "../../classes/PagamentoRecusadoError";
import { EtapaPagamento } from "../../components/EtapaPagamento";
import { usePagamento } from "../../hooks/usePagamento";
import { buscarReserva } from "../../services/buscarReserva";
import { pagarReserva } from "../../services/pagarReserva";
import type { Pagamento } from "../../types/pagamento";
import type { ReservaDetalhe } from "../../types/reservaDetalhe";
import { criarReservaFalsa } from "../fixtures/reserva";

const push = jest.fn();

jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
jest.mock("../../services/buscarReserva");
jest.mock("../../services/pagarReserva");

const passageiro = {
  id: 1, usuarioId: 3, nome: "Mariana Oliveira", email: "", celular: "", dataNasc: "", cpf: "", criadoEm: "", atualizadoEm: "",
};

function reservaCom(dados: Partial<ReservaDetalhe> = {}): ReservaDetalhe {
  return {
    ...criarReservaFalsa({ expiraEm: "2099-01-01T10:00:00-03:00" }),
    passageiros: [passageiro, { ...passageiro, id: 2, nome: "Pedro Souza" }], passagens: [],
    ...dados,
  };
}

function tentativa(dados: Partial<Pagamento>): Pagamento {
  return {
    id: 1, reservaId: 5087, reservaStatus: "PAGAMENTO_PENDENTE", valorCentavos: 24800, status: "NEGADO",
    metodoPagamento: "PIX", referenciaExterna: "SIM-PIX-1", criadoEm: "", atualizadoEm: "", ...dados,
  };
}

describe("EtapaPagamento", () => {
  afterEach(() => jest.useRealTimers());

  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(buscarReserva).mockResolvedValue(reservaCom());
  });

  it("mostra o PIX fictício, o prazo e o resumo com o total", async () => {
    render(<EtapaPagamento reservaId={5087} />);

    expect(await screen.findByRole("heading", { level: 1, name: "Forma de pagamento" })).toBeInTheDocument();
    expect(screen.getByText(/^Reserva expira em/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "PIX" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("img", { name: "QR Code PIX fictício" })).toBeInTheDocument();
    const resumo = screen.getByRole("complementary", { name: "Resumo da viagem" });
    expect(within(resumo).getByText("R$ 248,00")).toBeInTheDocument();
  });

  it("paga com o método escolhido e segue para a confirmação quando o backend aprova", async () => {
    jest.mocked(pagarReserva).mockResolvedValue(tentativa({ status: "APROVADO", reservaStatus: "PAGO", metodoPagamento: "CARTAO" }));
    render(<EtapaPagamento reservaId={5087} />);

    fireEvent.click(await screen.findByRole("button", { name: /Cartão de Crédito/ }));
    expect(screen.queryByRole("img", { name: "QR Code PIX fictício" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar pagamento" }));

    expect(await screen.findByRole("heading", { name: "Pagamento em processamento" })).toBeInTheDocument();
    expect(pagarReserva).toHaveBeenCalledWith(5087, "CARTAO");
    expect(push).toHaveBeenCalledWith("/reservas/5087/confirmacao");
  });

  it("mostra a recusa do backend e deixa tentar de novo", async () => {
    jest.mocked(pagarReserva).mockResolvedValue(tentativa({ status: "NEGADO" }));
    render(<EtapaPagamento reservaId={5087} />);

    fireEvent.click(await screen.findByRole("button", { name: "Confirmar pagamento" }));

    expect(await screen.findByRole("heading", { name: "Pagamento não aprovado" })).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(screen.getByRole("heading", { name: "Forma de pagamento" })).toBeInTheDocument();
  });

  it("trata a falha do provedor (502) como pagamento não aprovado", async () => {
    jest.mocked(pagarReserva).mockResolvedValue(null);
    render(<EtapaPagamento reservaId={5087} />);

    fireEvent.click(await screen.findByRole("button", { name: "Confirmar pagamento" }));

    expect(await screen.findByRole("heading", { name: "Pagamento não aprovado" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });

  it("na terceira recusa a reserva vira FALHA e não oferece nova tentativa", async () => {
    jest.mocked(pagarReserva).mockResolvedValue(tentativa({ status: "NEGADO", reservaStatus: "FALHA" }));
    render(<EtapaPagamento reservaId={5087} />);

    fireEvent.click(await screen.findByRole("button", { name: "Confirmar pagamento" }));

    expect(await screen.findByText(/3 tentativas recusadas/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tentar novamente" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Escolher poltronas" })).toHaveAttribute("href", "/viagens/7/assentos");
  });

  it("mostra a mensagem do backend quando ele não aceita o pagamento", async () => {
    jest.mocked(pagarReserva).mockRejectedValue(new PagamentoRecusadoError("Reserva expirada."));
    render(<EtapaPagamento reservaId={5087} />);

    fireEvent.click(await screen.findByRole("button", { name: "Confirmar pagamento" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Reserva expirada.");
    expect(screen.getByRole("heading", { name: "Forma de pagamento" })).toBeInTheDocument();
  });

  it("quando a reserva foi cancelada em outra aba, troca o formulário pelo aviso", async () => {
    jest.mocked(pagarReserva).mockRejectedValue(new PagamentoRecusadoError("Reserva não pode ser paga."));
    render(<EtapaPagamento reservaId={5087} />);
    const botao = await screen.findByRole("button", { name: "Confirmar pagamento" });
    jest.mocked(buscarReserva).mockResolvedValue(reservaCom({ status: "CANCELADO" }));

    fireEvent.click(botao);

    expect(await screen.findByRole("heading", { name: "Reserva cancelada" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Confirmar pagamento" })).not.toBeInTheDocument();
  });

  it("quando a reserva foi paga em outra aba, segue para o bilhete", async () => {
    jest.mocked(pagarReserva).mockRejectedValue(new PagamentoRecusadoError("Reserva não pode ser paga."));
    render(<EtapaPagamento reservaId={5087} />);
    const botao = await screen.findByRole("button", { name: "Confirmar pagamento" });
    jest.mocked(buscarReserva).mockResolvedValue(reservaCom({ status: "PAGO" }));

    fireEvent.click(botao);

    await waitFor(() => expect(push).toHaveBeenCalledWith("/reservas/5087/confirmacao"));
  });

  it("pede os passageiros antes de pagar", async () => {
    jest.mocked(buscarReserva).mockResolvedValue(reservaCom({ passageiros: [] }));
    render(<EtapaPagamento reservaId={5087} />);

    expect(await screen.findByRole("link", { name: "Informar passageiros" })).toHaveAttribute("href", "/reservas/5087/passageiros");
  });

  it("leva ao bilhete a reserva já paga", async () => {
    jest.mocked(buscarReserva).mockResolvedValue(reservaCom({ status: "PAGO" }));
    render(<EtapaPagamento reservaId={5087} />);

    expect(await screen.findByRole("link", { name: "Ver bilhete" })).toHaveAttribute("href", "/reservas/5087/confirmacao");
  });

  it("não abre o pagamento da reserva com prazo vencido", async () => {
    jest.mocked(buscarReserva).mockResolvedValue(reservaCom({ expiraEm: "2020-01-01T10:00:00-03:00" }));
    render(<EtapaPagamento reservaId={5087} />);

    expect(await screen.findByRole("heading", { name: "Prazo expirado" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Confirmar pagamento" })).not.toBeInTheDocument();
  });

  it("na terceira falha do provedor (502) busca a reserva e mostra que ela foi encerrada", async () => {
    jest.mocked(pagarReserva).mockResolvedValue(null);
    render(<EtapaPagamento reservaId={5087} />);
    const botao = await screen.findByRole("button", { name: "Confirmar pagamento" });
    jest.mocked(buscarReserva).mockResolvedValue(reservaCom({ status: "FALHA" }));

    fireEvent.click(botao);

    expect(await screen.findByText(/3 tentativas recusadas/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tentar novamente" })).not.toBeInTheDocument();
  });

  it("não envia um segundo pagamento enquanto o primeiro não volta", () => {
    // Pelo hook: na tela o botão some no primeiro clique, então só assim os dois disparos chegam à trava.
    jest.mocked(pagarReserva).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => usePagamento(5087, jest.fn()));

    act(() => {
      void result.current.pagar();
      void result.current.pagar();
    });

    expect(pagarReserva).toHaveBeenCalledTimes(1);
  });

  it("quando a conexão cai, busca a reserva e segue para o bilhete se ela já foi paga", async () => {
    jest.mocked(pagarReserva).mockRejectedValue(new TypeError("Failed to fetch"));
    render(<EtapaPagamento reservaId={5087} />);
    const botao = await screen.findByRole("button", { name: "Confirmar pagamento" });
    jest.mocked(buscarReserva).mockResolvedValue(reservaCom({ status: "PAGO" }));

    fireEvent.click(botao);

    await waitFor(() => expect(push).toHaveBeenCalledWith("/reservas/5087/confirmacao"));
  });

  it("quando a conexão cai e a reserva segue pendente, avisa sem a mensagem crua do navegador", async () => {
    jest.mocked(pagarReserva).mockRejectedValue(new TypeError("Failed to fetch"));
    render(<EtapaPagamento reservaId={5087} />);

    fireEvent.click(await screen.findByRole("button", { name: "Confirmar pagamento" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível falar com o servidor. Tente novamente.");
  });

  it("leva a reserva em FALHA de volta às poltronas", async () => {
    jest.mocked(buscarReserva).mockResolvedValue(reservaCom({ status: "FALHA" }));
    render(<EtapaPagamento reservaId={5087} />);

    expect(await screen.findByRole("link", { name: "Escolher poltronas" })).toHaveAttribute("href", "/viagens/7/assentos");
  });

  it("não troca a tela pelo aviso de prazo enquanto o pagamento está em andamento", async () => {
    jest.useFakeTimers({ now: new Date("2026-11-04T09:59:58-03:00") });
    jest.mocked(buscarReserva).mockResolvedValue(reservaCom({ expiraEm: "2026-11-04T10:00:00-03:00" }));
    jest.mocked(pagarReserva).mockReturnValue(new Promise(() => {}));
    render(<EtapaPagamento reservaId={5087} />);

    fireEvent.click(await screen.findByRole("button", { name: "Confirmar pagamento" }));
    act(() => jest.advanceTimersByTime(5000));

    expect(screen.getByRole("heading", { name: "Pagamento em processamento" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Prazo expirado" })).not.toBeInTheDocument();
  });

  it("avisa quando o navegador não deixa copiar o código PIX", async () => {
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockRejectedValue(new Error("negado")) } });
    render(<EtapaPagamento reservaId={5087} />);

    fireEvent.click(await screen.findByRole("button", { name: "Copiar código PIX" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/Não foi possível copiar/);
  });

  it("quando a conexão cai e a reserva ficou em FALHA, mostra que ela foi encerrada", async () => {
    jest.mocked(pagarReserva).mockRejectedValue(new TypeError("Failed to fetch"));
    render(<EtapaPagamento reservaId={5087} />);
    const botao = await screen.findByRole("button", { name: "Confirmar pagamento" });
    jest.mocked(buscarReserva).mockResolvedValue(reservaCom({ status: "FALHA" }));

    fireEvent.click(botao);

    expect(await screen.findByText(/3 tentativas recusadas/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tentar novamente" })).not.toBeInTheDocument();
  });

  it("com resposta ilegível, também pergunta à reserva antes de decidir", async () => {
    jest.mocked(pagarReserva).mockRejectedValue(new SyntaxError("Unexpected token"));
    render(<EtapaPagamento reservaId={5087} />);
    const botao = await screen.findByRole("button", { name: "Confirmar pagamento" });
    jest.mocked(buscarReserva).mockResolvedValue(reservaCom({ status: "PAGO" }));

    fireEvent.click(botao);

    await waitFor(() => expect(push).toHaveBeenCalledWith("/reservas/5087/confirmacao"));
  });
});
