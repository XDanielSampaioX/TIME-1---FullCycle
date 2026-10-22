"use client";

import { useRef } from "react";
import { Button } from "@/shared/components/Button";
import { useEdicaoPerfil } from "../hooks/useEdicaoPerfil";
import { useFocoPrimeiroErro } from "../hooks/useFocoPrimeiroErro";
import type { Usuario } from "../types/usuario";
import { CabecalhoPerfil } from "./CabecalhoPerfil";
import { CampoFormulario } from "./CampoFormulario";

const linha = "grid gap-4 sm:grid-cols-2";
const divisoria = "m-0 border-0 border-t border-(--color-border)";

function IconeCadeado() {
  return (
    <svg className="size-4 fill-none stroke-current stroke-[1.8]" viewBox="0 0 24 24">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

type FormularioEdicaoPerfilProps = {
  usuario: Usuario;
  aoCancelar: () => void;
};

export function FormularioEdicaoPerfil({ usuario, aoCancelar }: FormularioEdicaoPerfilProps) {
  const { dados, senha, enviando, alterado, querTrocarSenha, semAlteracaoParaSalvar, salvar } = useEdicaoPerfil(usuario);
  const formulario = useRef<HTMLFormElement>(null);
  useFocoPrimeiroErro(formulario, dados.erros);
  useFocoPrimeiroErro(formulario, senha.erros);

  const erroGeral = dados.erroGeral ?? senha.erroGeral;
  const semAlteracao = semAlteracaoParaSalvar && !alterado && !querTrocarSenha;

  return (
    <form
      className="grid gap-6"
      method="post"
      noValidate
      ref={formulario}
      onSubmit={(event) => {
        event.preventDefault();
        salvar();
      }}
    >
      <CabecalhoPerfil usuario={usuario} />
      <hr className={divisoria} />

      <div className="grid gap-4">
        <CampoFormulario
          nome="nome"
          titulo="Nome completo"
          type="text"
          autoComplete="name"
          value={dados.dados.nome}
          erro={dados.erros.nome}
          onChange={(event) => dados.alterarCampo("nome", event.target.value)}
        />
        <div className={linha}>
          <CampoFormulario
            nome="email"
            titulo="E-mail"
            type="email"
            autoComplete="email"
            value={dados.dados.email}
            erro={dados.erros.email}
            onChange={(event) => dados.alterarCampo("email", event.target.value)}
          />
          <CampoFormulario
            nome="celular"
            titulo="Celular"
            type="tel"
            autoComplete="tel-national"
            placeholder="(85) 99999-0000"
            value={dados.dados.celular}
            erro={dados.erros.celular}
            onChange={(event) => dados.alterarCampo("celular", event.target.value)}
          />
        </div>
        <div className={linha}>
          <CampoFormulario
            nome="cpf"
            titulo="CPF"
            type="text"
            value={usuario.cpf}
            ajuda="O CPF não pode ser alterado."
            disabled
            icone={<IconeCadeado />}
          />
          <CampoFormulario
            nome="dataNasc"
            titulo="Data de nascimento"
            type="date"
            autoComplete="bday"
            value={dados.dados.dataNasc}
            erro={dados.erros.dataNasc}
            onChange={(event) => dados.alterarCampo("dataNasc", event.target.value)}
          />
        </div>
      </div>
      <hr className={divisoria} />

      <fieldset className="m-0 grid gap-4 border-0 p-0">
        <legend className="mb-4 p-0 font-extrabold">Alterar senha</legend>
        <div className="grid gap-4 md:grid-cols-3">
          <CampoFormulario
            nome="senhaAtual"
            titulo="Senha atual"
            type="password"
            autoComplete="current-password"
            placeholder="Sua senha atual"
            value={senha.dados.senhaAtual}
            erro={senha.erros.senhaAtual}
            onChange={(event) => senha.alterarCampo("senhaAtual", event.target.value)}
          />
          <CampoFormulario
            nome="novaSenha"
            titulo="Nova senha"
            type="password"
            autoComplete="new-password"
            placeholder="Nova senha"
            value={senha.dados.novaSenha}
            erro={senha.erros.novaSenha}
            onChange={(event) => senha.alterarCampo("novaSenha", event.target.value)}
          />
          <CampoFormulario
            nome="confirmacaoNovaSenha"
            titulo="Confirmar nova senha"
            type="password"
            autoComplete="new-password"
            placeholder="Repita a nova senha"
            value={senha.dados.confirmacaoNovaSenha}
            erro={senha.erros.confirmacaoNovaSenha}
            onChange={(event) => senha.alterarCampo("confirmacaoNovaSenha", event.target.value)}
          />
        </div>
      </fieldset>
      <hr className={divisoria} />

      {erroGeral && (
        <p className="m-0 text-sm text-red-700" role="alert">
          {erroGeral}
        </p>
      )}
      {semAlteracao && (
        <p className="m-0 text-sm" role="status">
          Nenhuma alteração para salvar.
        </p>
      )}
      {senha.alterada && (
        <p className="m-0 text-sm font-bold" role="status">
          Senha alterada com sucesso.
        </p>
      )}
      {dados.salvo && (
        <p className="m-0 text-sm font-bold" role="status">
          Dados atualizados com sucesso.
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        <Button
          className="shadow-[inset_0_0_0_1px_var(--color-brand-950)]"
          type="button"
          variant="ghost"
          disabled={enviando}
          onClick={aoCancelar}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="secondary" disabled={enviando}>
          {enviando ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}
