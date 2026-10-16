"use client";

import { useRef } from "react";
import { Button } from "@/shared/components/Button";
import { useAlteracaoSenha } from "../hooks/useAlteracaoSenha";
import { useFocoPrimeiroErro } from "../hooks/useFocoPrimeiroErro";
import type { AlteracaoSenha } from "../types/alteracaoSenha";
import type { Usuario } from "../types/usuario";
import { CampoFormulario } from "./CampoFormulario";

const campos: { nome: keyof AlteracaoSenha; titulo: string; autoComplete: string }[] = [
  { nome: "senhaAtual", titulo: "Senha atual", autoComplete: "current-password" },
  { nome: "novaSenha", titulo: "Nova senha", autoComplete: "new-password" },
  { nome: "confirmacaoNovaSenha", titulo: "Confirmar nova senha", autoComplete: "new-password" },
];

export function FormularioAlteracaoSenha({ usuario }: { usuario: Usuario }) {
  const { dados, erros, erroGeral, enviando, alterada, alterarCampo, enviar } = useAlteracaoSenha(usuario);
  const formulario = useRef<HTMLFormElement>(null);
  useFocoPrimeiroErro(formulario, erros);

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
      {campos.map((campo) => (
        <CampoFormulario
          key={campo.nome}
          nome={campo.nome}
          titulo={campo.titulo}
          type="password"
          autoComplete={campo.autoComplete}
          value={dados[campo.nome]}
          erro={erros[campo.nome]}
          onChange={(event) => alterarCampo(campo.nome, event.target.value)}
        />
      ))}
      {erroGeral && (
        <p className="m-0 text-sm text-red-700" role="alert">
          {erroGeral}
        </p>
      )}
      {alterada && (
        <p className="m-0 text-sm font-bold" role="status">
          Senha alterada com sucesso.
        </p>
      )}
      <Button type="submit" disabled={enviando}>
        {enviando ? "Alterando..." : "Alterar senha"}
      </Button>
    </form>
  );
}
