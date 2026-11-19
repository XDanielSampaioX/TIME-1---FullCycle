"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAutenticacao } from "@/modules/autenticacao/hooks/useAutenticacao";
import { entrar } from "@/modules/autenticacao/services/entrar";
import { mascararCampo } from "@/shared/utils/mascaras";
import { regrasCadastroUsuario } from "../classes/validacao/regrasCadastroUsuario";
import { cadastrarUsuario } from "../services/cadastrarUsuario";
import type { CadastroUsuario } from "../types/cadastroUsuario";
import type { CamposCadastro } from "../types/camposCadastro";
import type { ErrosValidacao } from "../types/errosValidacao";

const CAMPOS_VAZIOS: CamposCadastro = {
  nome: "",
  email: "",
  cpf: "",
  celular: "",
  dataNasc: "",
  senha: "",
  confirmacaoSenha: "",
};
const ERRO_GERAL = "Não foi possível criar a conta. Tente novamente.";

// destino já chega validado pela página (só caminhos deste site).
export function useCadastroUsuario(destino: string) {
  const { iniciarSessao } = useAutenticacao();
  const router = useRouter();
  const [campos, setCampos] = useState(CAMPOS_VAZIOS);
  // erros: um por campo (validação local ou do backend). erroGeral: falha que não aponta um campo.
  const [erros, setErros] = useState<ErrosValidacao<CamposCadastro>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  // Conta os envios com erro: é o que leva o foco ao primeiro campo inválido (os erros mudam também ao digitar).
  const [tentativas, setTentativas] = useState(0);
  // A conta foi criada, mas o login automático falhou: a pessoa entra pela tela de login.
  const [contaCriada, setContaCriada] = useState(false);

  // CPF e celular ganham a máscara enquanto a pessoa digita; o backend aceita o valor com máscara.
  function alterarCampo(campo: keyof CamposCadastro, valor: string) {
    setCampos({ ...campos, [campo]: mascararCampo(campo, valor) });
    // O erro do campo some assim que a pessoa volta a digitar nele. A confirmação depende da senha:
    // mudar a senha também tira o "não confere" da confirmação, que seria um erro antigo na tela.
    setErros({ ...erros, [campo]: undefined, ...(campo === "senha" && { confirmacaoSenha: undefined }) });
  }

  function mostrarErros(novosErros: ErrosValidacao<CamposCadastro>) {
    setErros(novosErros);
    setTentativas((n) => n + 1);
  }

  // Erros do backend: os dos campos vão para baixo de cada campo; um erro fora dos campos vira aviso geral.
  function mostrarErrosDoServidor(errosDoServidor: ErrosValidacao<CadastroUsuario>) {
    const todos = Object.entries(errosDoServidor);
    const dosCampos = todos.filter(([campo]) => Object.hasOwn(CAMPOS_VAZIOS, campo));
    const foraDosCampos = todos.find(([campo]) => !Object.hasOwn(CAMPOS_VAZIOS, campo));

    if (foraDosCampos || dosCampos.length === 0) setErroGeral(foraDosCampos?.[1] ?? ERRO_GERAL);
    mostrarErros(Object.fromEntries(dosCampos));
  }

  async function entrarNaContaCriada({ email, senha }: CadastroUsuario) {
    try {
      const login = await entrar({ email, senha });

      if ("sessao" in login) {
        // Sem "Lembrar de mim": a sessão vale só nesta aba, o mais seguro por padrão.
        iniciarSessao(login.sessao, false);
        // replace: o botão "voltar" do navegador não traz de novo o formulário de cadastro.
        router.replace(destino);
        return;
      }
    } catch {
      // Sem resposta do login: a conta já existe, então a pessoa entra pela tela de login.
    }

    setContaCriada(true);
    setEnviando(false);
  }

  async function enviar() {
    setErroGeral(null);
    const errosLocais = regrasCadastroUsuario.validar(campos);
    if (Object.keys(errosLocais).length > 0) {
      mostrarErros(errosLocais);
      return;
    }

    setErros({});
    setEnviando(true);
    // A confirmação da senha não vai para o backend.
    const { nome, email, cpf, celular, dataNasc, senha } = campos;
    const dados: CadastroUsuario = { nome, email, cpf, celular, dataNasc, senha };

    try {
      const resultado = await cadastrarUsuario(dados);

      if ("erros" in resultado) {
        mostrarErrosDoServidor(resultado.erros);
        setEnviando(false);
        return;
      }
    } catch {
      // Falha de comunicação: o que foi digitado continua no formulário para tentar de novo.
      setErroGeral(ERRO_GERAL);
      setEnviando(false);
      return;
    }

    // Enquanto entra e muda de tela, o botão continua desabilitado: um segundo envio criaria a conta de novo.
    await entrarNaContaCriada(dados);
  }

  return { campos, erros, erroGeral, enviando, tentativas, contaCriada, alterarCampo, enviar };
}
