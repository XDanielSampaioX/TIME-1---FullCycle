"use client";

import Link from "next/link";
import { Button } from "@/shared/components/Button";
import { useLogin } from "../hooks/useLogin";
import type { Credenciais } from "../types/credenciais";

const campos: { nome: keyof Credenciais; titulo: string; tipo: string; autoComplete: string }[] = [
  { nome: "email", titulo: "E-mail", tipo: "email", autoComplete: "email" },
  { nome: "senha", titulo: "Senha", tipo: "password", autoComplete: "current-password" },
];

export function FormularioLogin() {
  const { credenciais, erro, enviando, alterarCampo, enviar } = useLogin();

  return (
    <form
      className="grid gap-4"
      method="post"
      onSubmit={(event) => {
        event.preventDefault();
        enviar();
      }}
    >
      {campos.map((campo) => (
        <label className="grid gap-1 text-sm font-bold" key={campo.nome}>
          {campo.titulo}
          <input
            className={`
              min-h-11 rounded-sm border border-(--color-border)
              bg-(--color-surface-card) px-3 font-normal
            `}
            type={campo.tipo}
            name={campo.nome}
            autoComplete={campo.autoComplete}
            required
            value={credenciais[campo.nome]}
            onChange={(event) => alterarCampo(campo.nome, event.target.value)}
          />
        </label>
      ))}
      {erro && (
        <p className="m-0 text-sm text-red-700" role="alert">
          {erro}
        </p>
      )}
      <Button type="submit" disabled={enviando}>
        {enviando ? "Entrando..." : "Entrar"}
      </Button>
      <p className="m-0 text-sm">
        Ainda não tem conta?{" "}
        <Link className="font-bold" href="/cadastro">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
