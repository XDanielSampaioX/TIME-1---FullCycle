import { fetchAutenticado } from "@/modules/autenticacao/services/fetchAutenticado";
import { excluirConta } from "../services/excluirConta";

jest.mock("@/modules/autenticacao/services/fetchAutenticado");

describe("excluirConta", () => {
  beforeEach(() => jest.resetAllMocks());

  it("envia DELETE para /api/v1/me/", async () => {
    jest.mocked(fetchAutenticado).mockResolvedValue({ ok: true, status: 204 } as Response);

    await excluirConta();

    expect(fetchAutenticado).toHaveBeenCalledWith(expect.stringContaining("/api/v1/me/"), { method: "DELETE" });
  });

  it("lança erro quando o backend recusa", async () => {
    jest.mocked(fetchAutenticado).mockResolvedValue({ ok: false, status: 500 } as Response);

    await expect(excluirConta()).rejects.toThrow("Não foi possível excluir a conta.");
  });
});
