import { fetchAutenticado } from "@/modules/autenticacao/services/fetchAutenticado";
import { buscarPassagem } from "../../services/buscarPassagem";

jest.mock("@/modules/autenticacao/services/fetchAutenticado");

function resposta(status: number, corpo: unknown = {}) {
  return { status, ok: status >= 200 && status < 300, json: async () => corpo } as Response;
}

describe("buscarPassagem", () => {
  beforeEach(() => jest.resetAllMocks());

  it("traz a passagem da rota do backend", async () => {
    jest.mocked(fetchAutenticado).mockResolvedValue(resposta(200, { id: 12, status: "CONFIRMADO" }));

    await expect(buscarPassagem(12)).resolves.toEqual({ id: 12, status: "CONFIRMADO" });
    expect(fetchAutenticado).toHaveBeenCalledWith(expect.stringContaining("/api/v1/passagens/12/"));
  });

  it("avisa quando o backend não devolve a passagem", async () => {
    jest.mocked(fetchAutenticado).mockResolvedValue(resposta(404, { detail: "Não encontrado." }));

    await expect(buscarPassagem(12)).rejects.toThrow("Não foi possível carregar a passagem.");
  });
});
