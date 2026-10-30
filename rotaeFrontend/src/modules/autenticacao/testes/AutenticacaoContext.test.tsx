import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AutenticacaoProvider } from "../contexts/AutenticacaoContext";
import { useAutenticacao } from "../hooks/useAutenticacao";
import { buscarUsuarioAutenticado } from "../services/buscarUsuarioAutenticado";
import { usuario } from "@/modules/usuario/testes/fixtures/usuario";
import type { Sessao } from "../types/sessao";

jest.mock("../services/buscarUsuarioAutenticado");

const sessao: Sessao = { access: "a", refresh: "r", user: usuario };

function Estado() {
  const { usuario: logado, estado, sessaoIndisponivel, iniciarSessao, atualizarSessao, sair } = useAutenticacao();

  return (
    <>
      <p>
        {logado ? logado.nome : "anônimo"} | {sessaoIndisponivel ? "indisponível" : "ok"}
      </p>
      <p>estado: {estado}</p>
      <button onClick={() => atualizarSessao({ user: { ...usuario, nome: "Outro nome" } })} type="button">
        renomear
      </button>
      <button onClick={sair} type="button">
        sair
      </button>
      <button onClick={() => iniciarSessao(sessao)} type="button">
        entrar
      </button>
    </>
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

  it("informa o estado da sessão: anônimo, autenticado e depois anônimo de novo", async () => {
    renderizar();
    expect(await screen.findByText("estado: anonimo")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "entrar" }));
    expect(screen.getByText("estado: autenticado")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "sair" }));
    expect(screen.getByText("estado: anonimo")).toBeInTheDocument();
  });

  it("atualizarSessao troca o usuário sem derrubar a sessão", async () => {
    localStorage.setItem("rotae.sessao", JSON.stringify(sessao));
    jest.mocked(buscarUsuarioAutenticado).mockResolvedValue(usuario);
    renderizar();
    await screen.findByText("estado: autenticado");

    fireEvent.click(screen.getByRole("button", { name: "renomear" }));

    expect(screen.getByText("Outro nome | ok")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("rotae.sessao")!)).toMatchObject({ access: "a", refresh: "r" });
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
    expect(screen.getByText("João Silva | ok")).toBeInTheDocument();
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

    expect(await screen.findByText("João Silva | indisponível")).toBeInTheDocument();
  });

  it("zera o aviso de indisponibilidade ao sair e ao entrar de novo", async () => {
    localStorage.setItem("rotae.sessao", JSON.stringify(sessao));
    jest.mocked(buscarUsuarioAutenticado).mockRejectedValue(new Error("sem rede"));
    renderizar();
    expect(await screen.findByText("João Silva | indisponível")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "sair" }));
    expect(screen.getByText("anônimo | ok")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "entrar" }));
    expect(screen.getByText("João Silva | ok")).toBeInTheDocument();
  });
});
