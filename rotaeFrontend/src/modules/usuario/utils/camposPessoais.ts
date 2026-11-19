import type { ComponentProps } from "react";
import type { CampoFormulario } from "@/shared/components/CampoFormulario";
import type { CadastroUsuario } from "../types/cadastroUsuario";

type DescritorCampo = Pick<
  ComponentProps<typeof CampoFormulario>,
  "nome" | "titulo" | "type" | "autoComplete" | "placeholder" | "inputMode"
>;

// Como cada campo pessoal aparece na tela: rótulo, tipo, preenchimento automático e exemplo.
// Usado pelo cadastro e pela edição de perfil: um ajuste aqui vale para as duas telas.
export const CAMPOS_PESSOAIS = {
  nome: { nome: "nome", titulo: "Nome completo", type: "text", autoComplete: "name", placeholder: "Seu nome completo" },
  email: { nome: "email", titulo: "E-mail", type: "email", autoComplete: "email", placeholder: "seu@email.com" },
  cpf: {
    nome: "cpf",
    titulo: "CPF",
    type: "text",
    inputMode: "numeric",
    autoComplete: "off",
    placeholder: "000.000.000-00",
  },
  celular: {
    nome: "celular",
    titulo: "Celular",
    type: "tel",
    autoComplete: "tel-national",
    placeholder: "(85) 99999-0000",
  },
  dataNasc: { nome: "dataNasc", titulo: "Data de nascimento", type: "date", autoComplete: "bday" },
} satisfies Record<Exclude<keyof CadastroUsuario, "senha">, DescritorCampo>;
