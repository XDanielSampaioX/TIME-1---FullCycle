"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Button } from "@/shared/components/Button";
import { useFocoPrimeiroErro } from "@/modules/usuario/hooks/useFocoPrimeiroErro";
import { CampoFormulario } from "@/shared/components/CampoFormulario";
import { useLogin } from "../hooks/useLogin";

function IconeOlho({ riscado }: { riscado: boolean }) {
  return (
    <svg className="size-5 fill-none stroke-current stroke-[1.8]" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
      {riscado && <path d="M4 4l16 16" />}
    </svg>
  );
}

export function FormularioLogin({ destino }: { destino: string }) {
  const { credenciais, lembrar, erros, erro, enviando, tentativas, alterarCampo, setLembrar, enviar } = useLogin(destino);
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const formulario = useRef<HTMLFormElement>(null);
  useFocoPrimeiroErro(formulario, tentativas);

  return (
    <form
      className="grid gap-4"
      method="post"
      noValidate
      ref={formulario}
      onSubmit={(event) => {
        event.preventDefault();
        enviar();
      }}
    >
      <CampoFormulario
        nome="email"
        titulo="E-mail"
        type="email"
        autoComplete="email"
        placeholder="seu@email.com"
        required
        erro={erros.email}
        value={credenciais.email}
        onChange={(event) => alterarCampo("email", event.target.value)}
      />
      <CampoFormulario
        nome="senha"
        titulo="Senha"
        type={senhaVisivel ? "text" : "password"}
        autoComplete="current-password"
        placeholder="Sua senha"
        required
        erro={erros.senha}
        value={credenciais.senha}
        onChange={(event) => alterarCampo("senha", event.target.value)}
        acao={
          <button
            className="grid size-9 cursor-pointer place-items-center rounded-(--radius-sm) border-0 bg-transparent text-(--color-text-muted)"
            type="button"
            aria-label={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
            onClick={() => setSenhaVisivel(!senhaVisivel)}
          >
            <IconeOlho riscado={!senhaVisivel} />
          </button>
        }
      />
      <label className="flex w-fit items-center gap-2 text-sm text-(--color-text-secondary)">
        <input
          className="size-4 accent-(--color-brand-800)"
          type="checkbox"
          checked={lembrar}
          onChange={(event) => setLembrar(event.target.checked)}
        />
        Lembrar de mim
      </label>
      {erro && (
        <p className="m-0 text-sm text-red-700" role="alert">
          {erro}
        </p>
      )}
      <Button className="w-full" type="submit" variant="secondary" disabled={enviando}>
        {enviando ? "Entrando..." : "Entrar"}
      </Button>
      <p className={`
        m-0 flex items-center gap-3 text-xs text-(--color-text-muted)
        before:h-px before:flex-1 before:bg-(--color-border) after:h-px after:flex-1 after:bg-(--color-border)
      `}>
        ou
      </p>
      <p className="m-0 text-center text-sm text-(--color-text-secondary)">
        Ainda não tem uma conta?{" "}
        <Link className="font-bold text-(--color-brand-800)" href="/cadastro">
          Criar conta
        </Link>
      </p>
      <p className="m-0 text-center text-xs text-(--color-text-muted)">
        Ao entrar, você concorda com nossos Termos de Uso e Política de Privacidade.
      </p>
    </form>
  );
}
