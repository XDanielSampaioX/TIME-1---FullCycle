
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FormularioCadastroUsuario } from "./FormularioCadastroUsuario";
import { criarUsuario } from "../services/criarUsuario";

jest.mock("../services/criarUsuario", () => ({
  criarUsuario: jest.fn(),
}));

const criarUsuarioMock = jest.mocked(criarUsuario);

describe("FormularioCadastroUsuario", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("preserva os dados quando a API falha", async () => {
    // 1. Simula uma falha da API.
    criarUsuarioMock.mockRejectedValueOnce(
      new Error("Falha simulada de conexão")
    );

    // 2. Renderiza o formulário.
    render(<FormularioCadastroUsuario />);

    // 3. Preenche os campos com dados de teste.
    fireEvent.change(
      screen.getByLabelText(/nome completo/i),
      { target: { value: "Ana Silva" } }
    );

    fireEvent.change(
      screen.getByLabelText(/e-mail/i),
      { target: { value: "ana@example.com" } }
    );

    fireEvent.change(
      screen.getByLabelText(/celular com ddd/i),
      { target: { value: "85999999999" } }
    );

    fireEvent.change(
      screen.getByLabelText(/data de nascimento/i),
      { target: { value: "2000-01-15" } }
    );

    fireEvent.change(
      screen.getByLabelText(/cpf/i),
      { target: { value: "52998224725" } }
    );

    fireEvent.change(
      screen.getByLabelText(/senha/i),
      { target: { value: "SenhaTeste123" } }
    );

    // 4. Tenta enviar o formulário.
    fireEvent.click(
      screen.getByRole("button", { name: "Criar conta" })
    );

    // 5. Confirma que a API simulada foi chamada.
    await waitFor(() => {
      expect(criarUsuarioMock).toHaveBeenCalledTimes(1);
    });

    // 6. Confirma que a falha foi informada.
    expect(
      await screen.findByRole("alert")
    ).toHaveProperty(
      "textContent",
      "Falha simulada de conexão"
    );

    // 7. Confirma que os valores continuam preenchidos.
    const nome = screen.getByLabelText(
      /nome completo/i
    ) as HTMLInputElement;

    const email = screen.getByLabelText(
      /e-mail/i
    ) as HTMLInputElement;

    expect(nome.value).toBe("Ana Silva");
    expect(email.value).toBe("ana@example.com");
  });
});
