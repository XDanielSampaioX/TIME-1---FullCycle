"use client";

import { type FormEvent, useState } from "react";
import { useUsuario } from "@/modules/usuario/contexts/UsuarioContext";
import { ErroCadastro } from "@/modules/usuario/types/ErroCadastro";
import { numeros, validacaoCadastro } from "@/modules/usuario/validacao/validacaoCadastro";
import type { ValoresCadastro } from "@/modules/usuario/validacao/valoresCadastro";

type Campo = keyof ValoresCadastro;
type ErrosCadastro = Partial<Record<Campo, string>>;
type CampoConfig = {
  name: Campo;
  label: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "tel";
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
};

const campos: CampoConfig[] = [
  { name: "nome", label: "Nome completo", autoComplete: "name", required: true },
  { name: "email", label: "E-mail", type: "email", autoComplete: "email", required: true },
  {
    name: "celular",
    label: "Celular com DDD",
    type: "tel",
    autoComplete: "tel",
    inputMode: "tel",
    placeholder: "(85) 99999-9999",
    maxLength: 16,
    required: true,
  },
  {
    name: "dataNasc",
    label: "Data de nascimento",
    type: "date",
    autoComplete: "bday",
    required: true,
  },
  {
    name: "cpf",
    label: "CPF",
    inputMode: "numeric",
    placeholder: "000.000.000-00",
    maxLength: 14,
    required: true,
  },
  { name: "senha", label: "Senha", type: "password", autoComplete: "new-password", required: true },
];

const iniciais: ValoresCadastro = { nome: "", email: "", senha: "", celular: "", dataNasc: "", cpf: "" };

export function FormularioCadastroUsuario() {
  const [valores, setValores] = useState<ValoresCadastro>(iniciais);
  const [errosCampo, setErrosCampo] = useState<ErrosCadastro>({});
  const [sucesso, setSucesso] = useState("");
  const [falhaApi, setFalhaApi] = useState(false);
  const { cadastrar, carregando, erro } = useUsuario();

  function alterar(campo: Campo, valor: string) {
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
    const primeiroCampoComErro = campos.find((campo) => erros[campo.name]);
    if (primeiroCampoComErro) {
      document.getElementById(`cadastro-${primeiroCampoComErro.name}`)?.focus();
      return;
    }

    try {
      await cadastrar({
  nome: valores.nome.trim(),
  email: valores.email.trim(),
  senha: valores.senha,
  celular: numeros(valores.celular),
  dataNasc: valores.dataNasc,
  cpf: numeros(valores.cpf),
});
      setValores(iniciais);
      setSucesso("Cadastro realizado com sucesso.");
    } catch (causa) {
  // Mantém os valores para uma nova tentativa.
  if (causa instanceof ErroCadastro) {
    setErrosCampo(causa.campos);
    const primeiro = campos.find((campo) => causa.campos[campo.name]);

    if (primeiro) {
      document.getElementById(`cadastro-${primeiro.name}`)?.focus();
    }
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
