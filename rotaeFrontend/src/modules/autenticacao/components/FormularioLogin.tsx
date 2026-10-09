"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessao } from "@/modules/autenticacao/contexts/SessaoContext";

export function FormularioLogin({ destino }: { destino: string }) {
  const router = useRouter();
  const { entrar, carregando } = useSessao();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [falha, setFalha] = useState<string | null>(null);

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (carregando) return;
    setFalha(null);
    try {
      await entrar({ email: email.trim(), senha });
      router.replace(destino);
      router.refresh();
    } catch (causa) {
      setFalha(causa instanceof Error ? causa.message : "Não foi possível entrar.");
    }
  }

  return (
    <form className="usuario-form" onSubmit={enviar}>
      <div className="usuario-field">
        <label htmlFor="login-email">E-mail</label>
        <input id="login-email" type="email" autoComplete="email" required value={email}
          onChange={(event) => setEmail(event.target.value)} />
      </div>
      <div className="usuario-field usuario-login-senha">
        <label htmlFor="login-senha">Senha</label>
        <input id="login-senha" type="password" autoComplete="current-password" required value={senha}
          onChange={(event) => setSenha(event.target.value)} />
      </div>
      {falha && <p className="usuario-feedback usuario-feedback-error" role="alert">{falha}</p>}
      <button className="shared-button shared-button-primary usuario-submit" type="submit" disabled={carregando}>
        {carregando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
