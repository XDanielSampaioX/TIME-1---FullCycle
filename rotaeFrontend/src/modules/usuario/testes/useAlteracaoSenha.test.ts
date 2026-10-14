import { act, renderHook } from "@testing-library/react";
import { useAlteracaoSenha } from "../hooks/useAlteracaoSenha";
import { alterarSenha } from "../services/alterarSenha";
import type { AlteracaoSenha } from "../types/alteracaoSenha";
import type { Usuario } from "../types/usuario";

const iniciarSessao = jest.fn();

jest.mock("@/modules/autenticacao/hooks/useAutenticacao", () => ({ useAutenticacao: () => ({ iniciarSessao }) }));
jest.mock("../services/alterarSenha");

const usuario = { id: 1, nome: "João Silva" } as Usuario;
const dados: AlteracaoSenha = { senhaAtual: "antiga-123", novaSenha: "nova-senha-123", confirmacaoNovaSenha: "nova-senha-123" };
const tokens = { access: "access-novo", refresh: "refresh-novo" };

async function preencherEEnviar(preenchido: AlteracaoSenha = dados) {
  const { result } = renderHook(() => useAlteracaoSenha(usuario));

  for (const [campo, valor] of Object.entries(preenchido)) {
    act(() => result.current.alterarCampo(campo as keyof AlteracaoSenha, valor));
  }
  await act(async () => {
    await result.current.enviar();
  });

  return result;
}

describe("useAlteracaoSenha", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    iniciarSessao.mockClear();
  });

  it("grava os tokens novos na sessão, limpa o formulário e confirma a troca", async () => {
    jest.mocked(alterarSenha).mockResolvedValue({ tokens });

    const result = await preencherEEnviar();

    expect(alterarSenha).toHaveBeenCalledWith(dados);
    expect(iniciarSessao).toHaveBeenCalledWith({ ...tokens, user: usuario });
    expect(result.current.dados).toEqual({ senhaAtual: "", novaSenha: "", confirmacaoNovaSenha: "" });
    expect(result.current.alterada).toBe(true);
  });

  it("não chama o backend quando a confirmação não confere", async () => {
    const result = await preencherEEnviar({ ...dados, confirmacaoNovaSenha: "diferente-123" });

    expect(result.current.erros).toEqual({ confirmacaoNovaSenha: "A confirmação não confere com a nova senha." });
    expect(alterarSenha).not.toHaveBeenCalled();
    expect(result.current.alterada).toBe(false);
  });

  it("mostra o erro de senha atual incorreta vindo do backend, sem mexer na sessão", async () => {
    jest.mocked(alterarSenha).mockResolvedValue({ erros: { senhaAtual: "Senha atual incorreta." } });

    const result = await preencherEEnviar();

    expect(result.current.erros).toEqual({ senhaAtual: "Senha atual incorreta." });
    expect(iniciarSessao).not.toHaveBeenCalled();
    expect(result.current.dados).toEqual(dados);
  });

  it("preserva os dados digitados quando o servidor não responde", async () => {
    jest.mocked(alterarSenha).mockRejectedValue(new Error("rede"));

    const result = await preencherEEnviar();

    expect(result.current.erroGeral).toBe("Não foi possível alterar a senha. Tente novamente.");
    expect(result.current.dados).toEqual(dados);
    expect(result.current.enviando).toBe(false);
    expect(iniciarSessao).not.toHaveBeenCalled();
  });
});
