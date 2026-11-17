"use client";

import Link from "next/link";
import { useRef, type ChangeEvent } from "react";
import { RodapeAcesso } from "@/modules/autenticacao/components/RodapeAcesso";
import { caminhoDoLogin } from "@/modules/autenticacao/utils/destinoAposLogin";
import { Button } from "@/shared/components/Button";
import { CampoFormulario } from "@/shared/components/CampoFormulario";
import { useCadastroUsuario } from "../hooks/useCadastroUsuario";
import { useFocoPrimeiroErro } from "../hooks/useFocoPrimeiroErro";
import type { CamposCadastro } from "../types/camposCadastro";

export function FormularioCadastroUsuario({ destino }: { destino: string }) {
  const {
    campos, erros, erroGeral, enviando, tentativas, contaCriada, alterarCampo, enviar,
  } = useCadastroUsuario(destino);
  const formulario = useRef<HTMLFormElement>(null);
  useFocoPrimeiroErro(formulario, tentativas);

  // O que todo campo do formulário recebe: nome, valor, erro e como avisar que mudou.
  function campo(nome: keyof CamposCadastro) {
    return {
      nome,
      required: true,
      erro: erros[nome],
      value: campos[nome],
      onChange: (event: ChangeEvent<HTMLInputElement>) => alterarCampo(nome, event.target.value),
    };
  }

  if (contaCriada) {
    return (
      <div className="grid gap-3" role="status">
        <p className="m-0">Conta criada com sucesso! Entre para continuar.</p>
        <Link className="font-bold text-(--color-brand-800)" href={caminhoDoLogin(destino)}>
          Entrar na minha conta
        </Link>
      </div>
    );
  }

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
      <CampoFormulario {...campo("nome")} titulo="Nome completo" autoComplete="name" placeholder="Seu nome completo" />
      <CampoFormulario {...campo("email")} titulo="E-mail" type="email" autoComplete="email" placeholder="seu@email.com" />
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoFormulario
          {...campo("cpf")}
          titulo="CPF"
          inputMode="numeric"
          autoComplete="off"
          placeholder="000.000.000-00"
        />
        <CampoFormulario
          {...campo("celular")}
          titulo="Celular"
          type="tel"
          autoComplete="tel-national"
          placeholder="(00) 00000-0000"
        />
      </div>
      <CampoFormulario {...campo("dataNasc")} titulo="Data de nascimento" type="date" autoComplete="bday" />
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoFormulario
          {...campo("senha")}
          titulo="Senha"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo de 8 caracteres"
        />
        <CampoFormulario
          {...campo("confirmacaoSenha")}
          titulo="Confirmar senha"
          type="password"
          autoComplete="new-password"
          placeholder="Repita a senha"
        />
      </div>
      {erroGeral && (
        <p className="m-0 text-sm text-red-700" role="alert">
          {erroGeral}
        </p>
      )}
      <Button className="w-full" type="submit" variant="secondary" disabled={enviando}>
        {enviando ? "Criando conta..." : "Criar minha conta"}
      </Button>
      <RodapeAcesso
        pergunta="Já tem uma conta?"
        link={{ texto: "Entrar", href: caminhoDoLogin(destino) }}
        acao="Ao criar sua conta"
      />
    </form>
  );
}
