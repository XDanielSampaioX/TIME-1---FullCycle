import { act, renderHook } from "@testing-library/react";
import type { Sessao } from "@/modules/autenticacao/types/sessao";
import { salvarSessao } from "@/modules/autenticacao/utils/sessaoSalva";
import { useAtualizacaoUsuario } from "../hooks/useAtualizacaoUsuario";
import { atualizarUsuario } from "../services/atualizarUsuario";
import type { AtualizacaoUsuario } from "../types/atualizacaoUsuario";
import type { Usuario } from "../types/usuario";

const iniciarSessao = jest.fn();

jest.mock("@/modules/autenticacao/hooks/useAutenticacao", () => ({ useAutenticacao: () => ({ iniciarSessao }) }));
jest.mock("../services/atualizarUsuario");

const usuario: Usuario = {
  id: 1,
  nome: "João Silva",
  email: "joao@email.com",
  celular: "85999990000",
  dataNasc: "1995-04-20",
  cpf: "52998224725",
  criadoEm: "2026-10-14T08:00:00-03:00",
  atualizadoEm: "2026-10-14T08:00:00-03:00",
};
const sessao: Sessao = { access: "access", refresh: "refresh", user: usuario };

function montar() {
  return renderHook(() => useAtualizacaoUsuario(usuario));
}

async function alterarEEnviar(result: ReturnType<typeof montar>["result"], alteracoes: Partial<AtualizacaoUsuario>) {
  for (const [campo, valor] of Object.entries(alteracoes)) {
    act(() => result.current.alterarCampo(campo as keyof AtualizacaoUsuario, valor));
  }
  await act(async () => {
    await result.current.enviar();
  });
}

describe("useAtualizacaoUsuario", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
    salvarSessao(sessao);
    iniciarSessao.mockClear();
  });

  it("começa com os dados atuais do usuário", () => {
    const { result } = montar();

    expect(result.current.dados).toEqual({
      nome: "João Silva",
      email: "joao@email.com",
      celular: "85999990000",
      dataNasc: "1995-04-20",
    });
  });

  it("aceita usuário sem celular e sem data de nascimento", () => {
    const semDados = { ...usuario, celular: null, dataNasc: null } as unknown as Usuario;
    const { result } = renderHook(() => useAtualizacaoUsuario(semDados));

    expect(result.current.dados).toMatchObject({ celular: "", dataNasc: "" });
  });

  it("grava o usuário atualizado na sessão, mantendo os tokens", async () => {
    const atualizado = { ...usuario, nome: "João Souza" };
    jest.mocked(atualizarUsuario).mockResolvedValue({ usuario: atualizado });
    const { result } = montar();

    await alterarEEnviar(result, { nome: "João Souza" });

    expect(atualizarUsuario).toHaveBeenCalledWith(expect.objectContaining({ nome: "João Souza" }));
    expect(iniciarSessao).toHaveBeenCalledWith({ access: "access", refresh: "refresh", user: atualizado });
    expect(result.current.salvo).toBe(true);
  });

  it("usa os tokens renovados durante a requisição", async () => {
    jest.mocked(atualizarUsuario).mockImplementation(async () => {
      salvarSessao({ ...sessao, access: "access-renovado", refresh: "refresh-renovado" });
      return { usuario };
    });
    const { result } = montar();

    await alterarEEnviar(result, { nome: "João Souza" });

    expect(iniciarSessao).toHaveBeenCalledWith({ access: "access-renovado", refresh: "refresh-renovado", user: usuario });
  });

  it("não chama o backend quando a validação local reprova", async () => {
    const { result } = montar();

    await alterarEEnviar(result, { email: "invalido" });

    expect(result.current.erros).toEqual({ email: "Informe um e-mail válido." });
    expect(atualizarUsuario).not.toHaveBeenCalled();
    expect(result.current.salvo).toBe(false);
  });

  it("mostra os erros por campo do backend e não altera a sessão", async () => {
    jest.mocked(atualizarUsuario).mockResolvedValue({ erros: { email: "Já existe um usuário com este e-mail." } });
    const { result } = montar();

    await alterarEEnviar(result, { email: "outro@email.com" });

    expect(result.current.erros).toEqual({ email: "Já existe um usuário com este e-mail." });
    expect(iniciarSessao).not.toHaveBeenCalled();
    expect(result.current.salvo).toBe(false);
  });

  it("preserva os dados digitados quando o servidor não responde", async () => {
    jest.mocked(atualizarUsuario).mockRejectedValue(new Error("rede"));
    const { result } = montar();

    await alterarEEnviar(result, { nome: "João Souza" });

    expect(result.current.erroGeral).toBe("Não foi possível salvar as alterações. Tente novamente.");
    expect(result.current.dados.nome).toBe("João Souza");
    expect(result.current.enviando).toBe(false);
  });

  it("esconde a confirmação de salvo quando o usuário volta a editar", async () => {
    jest.mocked(atualizarUsuario).mockResolvedValue({ usuario });
    const { result } = montar();

    await alterarEEnviar(result, { nome: "João Souza" });
    expect(result.current.salvo).toBe(true);

    act(() => result.current.alterarCampo("nome", "João S."));
    expect(result.current.salvo).toBe(false);
  });
});
