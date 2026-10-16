"use client";

import { useRef } from "react";
import { Button } from "@/shared/components/Button";
import { useAtualizacaoUsuario } from "../hooks/useAtualizacaoUsuario";
import { useFocoPrimeiroErro } from "../hooks/useFocoPrimeiroErro";
import type { AtualizacaoUsuario } from "../types/atualizacaoUsuario";
import type { Usuario } from "../types/usuario";
import { CampoFormulario } from "./CampoFormulario";

const campos: { nome: keyof AtualizacaoUsuario; titulo: string; tipo: string; autoComplete: string; placeholder?: string }[] = [
  { nome: "nome", titulo: "Nome completo", tipo: "text", autoComplete: "name" },
  { nome: "email", titulo: "E-mail", tipo: "email", autoComplete: "email" },
  { nome: "celular", titulo: "Celular", tipo: "tel", autoComplete: "tel-national", placeholder: "(85) 99999-0000" },
  { nome: "dataNasc", titulo: "Data de nascimento", tipo: "date", autoComplete: "bday" },
];

export function FormularioEdicaoDados({ usuario }: { usuario: Usuario }) {
  const { dados, erros, erroGeral, enviando, salvo, alterarCampo, enviar } = useAtualizacaoUsuario(usuario);
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
          type={campo.tipo}
          autoComplete={campo.autoComplete}
          placeholder={campo.placeholder}
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
      {salvo && (
        <p className="m-0 text-sm font-bold" role="status">
          Dados atualizados com sucesso.
        </p>
      )}
      <Button type="submit" disabled={enviando}>
        {enviando ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  );
}
