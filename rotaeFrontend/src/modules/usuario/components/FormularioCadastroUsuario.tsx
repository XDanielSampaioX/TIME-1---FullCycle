"use client";

import Link from "next/link";
import { Button } from "@/shared/components/Button";
import { useCadastroUsuario } from "../hooks/useCadastroUsuario";
import type { CadastroUsuario } from "../types/cadastroUsuario";

const grupos: {
  titulo: string;
  campos: { nome: keyof CadastroUsuario; titulo: string; tipo: string; autoComplete: string; placeholder?: string }[];
}[] = [
  {
    titulo: "Dados pessoais",
    campos: [
      { nome: "nome", titulo: "Nome completo", tipo: "text", autoComplete: "name" },
      { nome: "cpf", titulo: "CPF", tipo: "text", autoComplete: "off", placeholder: "000.000.000-00" },
      { nome: "dataNasc", titulo: "Data de nascimento", tipo: "date", autoComplete: "bday" },
      { nome: "celular", titulo: "Celular", tipo: "tel", autoComplete: "tel-national", placeholder: "(85) 99999-0000" },
    ],
  },
  {
    titulo: "Dados de acesso",
    campos: [
      { nome: "email", titulo: "E-mail", tipo: "email", autoComplete: "email" },
      { nome: "senha", titulo: "Senha", tipo: "password", autoComplete: "new-password" },
    ],
  },
];

export function FormularioCadastroUsuario() {
  const { dados, erros, erroGeral, enviando, usuario, alterarCampo, enviar } = useCadastroUsuario();

  if (usuario) {
    return (
      <div className="grid gap-4" role="status">
        <p className="m-0">
          Conta criada com sucesso, {usuario.nome}!
        </p>
        <Link className="font-bold" href="/login">
          Entrar na minha conta
        </Link>
      </div>
    );
  }

  return (
    <form
      className="grid gap-6"
      method="post"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        enviar();
      }}
    >
      {grupos.map((grupo) => (
        <fieldset className="m-0 grid gap-4 border-0 p-0" key={grupo.titulo}>
          <legend className={`
            mb-3 p-0 text-xs font-extrabold
            tracking-widest text-(--color-text-secondary) uppercase
          `}>
            {grupo.titulo}
          </legend>
          {grupo.campos.map((campo) => (
            <label className="grid gap-1 text-sm font-bold" key={campo.nome}>
              {campo.titulo}
              <input
                className={`
                  min-h-11 rounded-(--radius-sm) border border-(--color-border)
                  bg-(--color-surface-card) px-3 font-normal
                  aria-invalid:border-red-700
                `}
                type={campo.tipo}
                name={campo.nome}
                autoComplete={campo.autoComplete}
                placeholder={campo.placeholder}
                value={dados[campo.nome]}
                aria-invalid={Boolean(erros[campo.nome])}
                aria-describedby={erros[campo.nome] ? `erro-${campo.nome}` : undefined}
                onChange={(event) => alterarCampo(campo.nome, event.target.value)}
              />
              {erros[campo.nome] && (
                <span className="font-normal text-red-700" id={`erro-${campo.nome}`}>
                  {erros[campo.nome]}
                </span>
              )}
            </label>
          ))}
        </fieldset>
      ))}
      {erroGeral && (
        <p className="m-0 text-sm text-red-700" role="alert">
          {erroGeral}
        </p>
      )}
      <Button type="submit" disabled={enviando}>
        {enviando ? "Criando conta..." : "Criar conta"}
      </Button>
      <p className="m-0 text-sm">
        Já tem conta?{" "}
        <Link className="font-bold" href="/login">
          Entrar
        </Link>
      </p>
    </form>
  );
}
