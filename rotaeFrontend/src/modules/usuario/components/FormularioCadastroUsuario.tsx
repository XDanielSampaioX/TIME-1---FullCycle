"use client";

import { type FormEvent, useState } from "react";
import { useUsuario } from "@/modules/usuario/contexts/UsuarioContext";
import { ErroCadastro } from "@/modules/usuario/types/ErroCadastro";
import { CAMPOS_CADASTRO, type CadastroUsuarioPayload, type CampoCadastro } from "@/modules/usuario/types/cadastroUsuarioPayload";
import type { ErrosCadastro } from "@/modules/usuario/validacao/errosCadastro";
import { numeros, validacaoCadastro } from "@/modules/usuario/validacao/validacaoCadastro";

type CampoConfig = {
  label: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "tel";
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
};

const configuracaoCampos: Record<CampoCadastro, CampoConfig> = {
  nome: { label: "Nome completo", autoComplete: "name", required: true },
  email: { label: "E-mail", type: "email", autoComplete: "email", required: true },
  celular: {
    label: "Celular com DDD",
    type: "tel",
    autoComplete: "tel",
    inputMode: "tel",
    placeholder: "(85) 99999-9999",
    maxLength: 16,
    required: true,
  },
  dataNasc: {
    label: "Data de nascimento",
    type: "date",
    autoComplete: "bday",
    required: true,
  },
  cpf: {
    label: "CPF",
    inputMode: "numeric",
    placeholder: "000.000.000-00",
    maxLength: 14,
    required: true,
  },
  senha: { label: "Senha", type: "password", autoComplete: "new-password", required: true },
};

const campos = CAMPOS_CADASTRO.map((name) => ({ name, ...configuracaoCampos[name] }));

const iniciais = Object.fromEntries(CAMPOS_CADASTRO.map((campo) => [campo, ""])) as CadastroUsuarioPayload;

function focarPrimeiroErro(erros: ErrosCadastro) {
  const primeiro = campos.find((campo) => erros[campo.name]);
  if (primeiro) document.getElementById(`cadastro-${primeiro.name}`)?.focus();
  return Boolean(primeiro);
}

export function FormularioCadastroUsuario() {
  const [valores, setValores] = useState<CadastroUsuarioPayload>(iniciais);
  const [errosCampo, setErrosCampo] = useState<ErrosCadastro>({});
  const [sucesso, setSucesso] = useState("");
  const [falhaApi, setFalhaApi] = useState(false);
  const { cadastrar, carregando, erro } = useUsuario();

  function alterar(campo: CampoCadastro, valor: string) {
    setValores((anteriores) => ({ ...anteriores, [campo]: valor }));
    setErrosCampo((anteriores) => ({ ...anteriores, [campo]: undefined }));
    setSucesso("");
    setFalhaApi(false);
  }

  async function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (carregando) return;
    setSucesso("");
    setFalhaApi(false);

    const erros = validacaoCadastro.validar(valores);
    setErrosCampo(erros);
    if (focarPrimeiroErro(erros)) return;

    try {
      await cadastrar({
        ...valores,
        nome: valores.nome.trim(),
        email: valores.email.trim(),
        celular: numeros(valores.celular),
        cpf: numeros(valores.cpf),
      });
      setValores(iniciais);
      setSucesso("Cadastro realizado com sucesso.");
    } catch (causa) {
      // Mantém os valores para uma nova tentativa.
      if (causa instanceof ErroCadastro) {
        setErrosCampo(causa.campos);
        focarPrimeiroErro(causa.campos);
      } else {
        setFalhaApi(true);
      }
    }
  }

  return (
    <form className="usuario-form" onSubmit={enviarFormulario} noValidate>
      <p className="usuario-form-note">Os campos marcados com * são obrigatórios.</p>
      <div className="usuario-form-grid">
        {campos.map((campo) => {
          const id = `cadastro-${campo.name}`;
          const idErro = `erro-${campo.name}`;
          const mensagem = errosCampo[campo.name];
          return (
            <div className="usuario-field" key={campo.name}>
              <label htmlFor={id}>{campo.label}{campo.required ? " *" : ""}</label>
              <input id={id} name={campo.name} type={campo.type ?? "text"}
                autoComplete={campo.autoComplete} inputMode={campo.inputMode}
                placeholder={campo.placeholder} maxLength={campo.maxLength}
                required={campo.required} value={valores[campo.name]}
                onChange={(event) => alterar(campo.name, event.target.value)}
                aria-invalid={Boolean(mensagem)} aria-describedby={mensagem ? idErro : undefined} />
              {mensagem && <p id={idErro} className="usuario-field-error">{mensagem}</p>}
            </div>
          );
        })}
      </div>

      {falhaApi && <p className="usuario-feedback usuario-feedback-error" role="alert">
        {erro ?? "Não foi possível realizar o cadastro. Seus dados foram mantidos; tente novamente."}
      </p>}
      {sucesso && <p className="usuario-feedback usuario-feedback-success" role="status">{sucesso}</p>}
      <button className="shared-button shared-button-primary usuario-submit" type="submit" disabled={carregando}>
        {carregando ? "Cadastrando..." : "Criar conta"}
      </button>
    </form>
  );
}
