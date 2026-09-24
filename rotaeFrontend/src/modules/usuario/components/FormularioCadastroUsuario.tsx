"use client";

import { FormEvent, useState } from "react";
import { useUsuario } from "@/modules/usuario/contexts/UsuarioContext";

export function FormularioCadastroUsuario() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const { cadastrar, carregando, erro } = useUsuario();
  const [sucesso, setSucesso] = useState("");

  async function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSucesso("");

    try {
      await cadastrar({ nome, email, senhaHash: senha });
      setNome("");
      setEmail("");
      setSenha("");
      setSucesso("Cadastro realizado com sucesso.");
    } catch {
      // O contexto mantém e expõe a mensagem de erro para a interface.
    }
  }

  return (
    <form onSubmit={enviarFormulario} className="usuario-form">
      <label>
        Nome
        <input required value={nome} onChange={(event) => setNome(event.target.value)} />
      </label>

      <label>
        E-mail
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <label>
        Senha
        <input
          required
          minLength={6}
          type="password"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
        />
      </label>

      <button type="submit" disabled={carregando}>
        {carregando ? "Cadastrando..." : "Criar conta"}
      </button>

      {(sucesso || erro) && <p role="status">{sucesso || erro}</p>}
    </form>
  );
}
