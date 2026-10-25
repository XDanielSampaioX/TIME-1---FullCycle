import { render, screen, waitFor } from "@testing-library/react";
import { AutenticacaoProvider } from "../contexts/AutenticacaoContext";
import { useAutenticacao } from "../hooks/useAutenticacao";
import { buscarUsuarioAutenticado } from "../services/buscarUsuarioAutenticado";
import type { Sessao } from "../types/sessao";

jest.mock("../services/buscarUsuarioAutenticado");

const usuario = {
  id: 1,
  nome: "Snow",
  email: "snow@email.com",
  celular: "(85) 99999-0000",
  dataNasc: "1995-04-20",
  cpf: "529.982.247-25",
  criadoEm: "2026-10-01T10:00:00Z",
  atualizadoEm: "2026-10-01T10:00:00Z",
};
const sessao: Sessao = { access: "a", refresh: "r", user: usuario };

function Estado() {
  const { usuario: logado, sessaoIndisponivel } = useAutenticacao();

  return (
    <p>
      {logado ? logado.nome : "anônimo"} | {sessaoIndisponivel ? "indisponível" : "ok"}
    </p>
  );
}

function renderizar() {
  return render(
    <AutenticacaoProvider>
      <Estado />
    </AutenticacaoProvider>,
  );
}

describe("AutenticacaoProvider", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
  });

  it("não consulta o servidor nem avisa indisponibilidade quando não há sessão", () => {
    renderizar();

    expect(screen.getByText("anônimo | ok")).toBeInTheDocument();
    expect(buscarUsuarioAutenticado).not.toHaveBeenCalled();
  });

  it("consulta o servidor uma vez e mantém a sessão quando ele confirma", async () => {
    localStorage.setItem("rotae.sessao", JSON.stringify(sessao));
    jest.mocked(buscarUsuarioAutenticado).mockResolvedValue(usuario);
    renderizar();

    await waitFor(() => expect(buscarUsuarioAutenticado).toHaveBeenCalledTimes(1));
    expect(screen.getByText("Snow | ok")).toBeInTheDocument();
  });

  it("encerra a sessão quando o servidor diz que ela não vale mais", async () => {
    localStorage.setItem("rotae.sessao", JSON.stringify(sessao));
    jest.mocked(buscarUsuarioAutenticado).mockResolvedValue(null);
    renderizar();

    expect(await screen.findByText("anônimo | ok")).toBeInTheDocument();
  });

  it("mantém a sessão e avisa que está indisponível quando o servidor não responde", async () => {
    localStorage.setItem("rotae.sessao", JSON.stringify(sessao));
    jest.mocked(buscarUsuarioAutenticado).mockRejectedValue(new Error("sem rede"));
    renderizar();

    expect(await screen.findByText("Snow | indisponível")).toBeInTheDocument();
  });
});
