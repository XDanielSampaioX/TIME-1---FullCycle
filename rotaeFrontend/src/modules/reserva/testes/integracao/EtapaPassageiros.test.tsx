import { fireEvent, render, screen, within } from "@testing-library/react";
import { useAutenticacao } from "@/modules/autenticacao/hooks/useAutenticacao";
import { EtapaPassageiros } from "../../components/EtapaPassageiros";
import { buscarReserva } from "../../services/buscarReserva";
import { cadastrarPassageiros } from "../../services/cadastrarPassageiros";
import type { ReservaDetalhe } from "../../types/reservaDetalhe";
import { criarReservaFalsa } from "../fixtures/reserva";

const push = jest.fn();

jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
jest.mock("@/modules/autenticacao/hooks/useAutenticacao");
jest.mock("../../services/buscarReserva");
jest.mock("../../services/cadastrarPassageiros");

const usuario = {
  id: 3,
  nome: "Mariana Oliveira",
  email: "mariana@email.com",
  celular: "85999990000",
  dataNasc: "1995-04-20",
  cpf: "52998224725",
  criadoEm: "",
  atualizadoEm: "",
};
const pedro = { nome: "Pedro Souza", cpf: "111.444.777-35", dataNasc: "1996-05-15", celular: "(85) 98888-0000", email: "pedro@email.com" };

function reservaCom(dados: Partial<ReservaDetalhe> = {}): ReservaDetalhe {
  return { ...criarReservaFalsa({ expiraEm: "2099-01-01T10:00:00-03:00" }), passageiros: [], ...dados };
}

async function passageiro(numero: number) {
  return within(await screen.findByRole("group", { name: `Passageiro ${numero}` }));
}

function preencher(bloco: ReturnType<typeof within>, dados: typeof pedro) {
  fireEvent.change(bloco.getByLabelText("Nome completo"), { target: { value: dados.nome } });
  fireEvent.change(bloco.getByLabelText("CPF"), { target: { value: dados.cpf } });
  fireEvent.change(bloco.getByLabelText("Data de nascimento"), { target: { value: dados.dataNasc } });
  fireEvent.change(bloco.getByLabelText("Celular"), { target: { value: dados.celular } });
  fireEvent.change(bloco.getByLabelText("E-mail"), { target: { value: dados.email } });
}

describe("EtapaPassageiros", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(useAutenticacao).mockReturnValue({ estado: "autenticado", usuario } as ReturnType<typeof useAutenticacao>);
    jest.mocked(buscarReserva).mockResolvedValue(reservaCom());
  });

  it("mostra um card por passagem e o resumo da viagem", async () => {
    render(<EtapaPassageiros reservaId={5087} />);

    expect(await screen.findAllByRole("group", { name: /^Passageiro/ })).toHaveLength(2);
    const resumo = screen.getByRole("complementary", { name: "Resumo da viagem" });
    expect(within(resumo).getByText("45, 46")).toBeInTheDocument();
    expect(within(resumo).getByText("Grátis")).toBeInTheDocument();
  });

  it("preenche um passageiro com a conta quando o comprador viaja e limpa ao desmarcar", async () => {
    render(<EtapaPassageiros reservaId={5087} />);
    const primeiro = await passageiro(1);
    const segundo = await passageiro(2);
    const comprador = screen.getByRole("checkbox", { name: "O comprador é um dos passageiros listados abaixo" });
    preencher(primeiro, pedro);

    fireEvent.click(comprador);

    // O Passageiro 1 já tinha dados, então a conta vai para o primeiro passageiro vazio.
    expect(primeiro.getByLabelText("Nome completo")).toHaveValue("Pedro Souza");
    expect(segundo.getByLabelText("Nome completo")).toHaveValue("Mariana Oliveira");
    expect(segundo.getByLabelText("CPF")).toHaveValue("52998224725");
    expect(comprador).toBeChecked();

    fireEvent.click(comprador);

    expect(segundo.getByLabelText("Nome completo")).toHaveValue("");
    expect(comprador).not.toBeChecked();
  });

  it("marca o comprador quando alguém digita o CPF da conta", async () => {
    render(<EtapaPassageiros reservaId={5087} />);

    fireEvent.change((await passageiro(2)).getByLabelText("CPF"), { target: { value: "529.982.247-25" } });

    expect(screen.getByRole("checkbox", { name: "O comprador é um dos passageiros listados abaixo" })).toBeChecked();
  });

  it("não envia com campos vazios nem com o mesmo CPF em dois passageiros", async () => {
    render(<EtapaPassageiros reservaId={5087} />);
    const primeiro = await passageiro(1);
    const segundo = await passageiro(2);
    preencher(primeiro, pedro);
    fireEvent.click(screen.getByRole("button", { name: "Confirmar reserva" }));

    expect(segundo.getByText("Informe o nome.")).toBeInTheDocument();

    preencher(segundo, { ...pedro, cpf: "11144477735" });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar reserva" }));

    expect(segundo.getByText("Este CPF já está em outro passageiro.")).toBeInTheDocument();
    expect(cadastrarPassageiros).not.toHaveBeenCalled();
  });

  it("envia os passageiros e pula o pagamento, indo para a confirmação", async () => {
    jest.mocked(cadastrarPassageiros).mockResolvedValue(null);
    render(<EtapaPassageiros reservaId={5087} />);
    await passageiro(1);
    fireEvent.click(screen.getByRole("checkbox", { name: "O comprador é um dos passageiros listados abaixo" }));
    preencher(await passageiro(2), pedro);

    fireEvent.click(screen.getByRole("button", { name: "Confirmar reserva" }));

    expect(await screen.findByRole("button", { name: "Salvando…" })).toBeDisabled();
    expect(cadastrarPassageiros).toHaveBeenCalledWith(5087, [
      { nome: "Mariana Oliveira", cpf: "52998224725", dataNasc: "1995-04-20", celular: "85999990000", email: "mariana@email.com" },
      pedro,
    ]);
    expect(push).toHaveBeenCalledWith("/reservas/5087/confirmacao");
  });

  it("mostra no passageiro certo o campo recusado pelo backend", async () => {
    jest.mocked(cadastrarPassageiros).mockResolvedValue([{}, { cpf: "CPF inválido." }]);
    render(<EtapaPassageiros reservaId={5087} />);
    preencher(await passageiro(1), { ...pedro, cpf: "52998224725" });
    preencher(await passageiro(2), pedro);

    fireEvent.click(screen.getByRole("button", { name: "Confirmar reserva" }));

    expect(await (await passageiro(2)).findByText("CPF inválido.")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("mostra a recusa da reserva inteira", async () => {
    jest.mocked(cadastrarPassageiros).mockRejectedValue(new Error("Reserva expirada."));
    render(<EtapaPassageiros reservaId={5087} />);
    preencher(await passageiro(1), { ...pedro, cpf: "52998224725" });
    preencher(await passageiro(2), pedro);

    fireEvent.click(screen.getByRole("button", { name: "Confirmar reserva" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Reserva expirada.");
  });

  it("não abre o formulário quando a reserva já tem passageiros", async () => {
    jest.mocked(buscarReserva).mockResolvedValue(reservaCom({ passageiros: [{ ...usuario, usuarioId: 3 }] }));
    render(<EtapaPassageiros reservaId={5087} />);

    expect(await screen.findByText("Passageiros já informados")).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: /^Passageiro/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver minhas viagens" })).toHaveAttribute("href", "/minhas-viagens");
  });

  it("não abre o formulário quando o prazo da reserva acabou", async () => {
    jest.mocked(buscarReserva).mockResolvedValue(reservaCom({ expiraEm: "2020-01-01T10:00:00-03:00" }));
    render(<EtapaPassageiros reservaId={5087} />);

    expect(await screen.findByText("Prazo expirado")).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: /^Passageiro/ })).not.toBeInTheDocument();
  });
});
