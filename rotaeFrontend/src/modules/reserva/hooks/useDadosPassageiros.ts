"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAutenticacao } from "@/modules/autenticacao/hooks/useAutenticacao";
import type { ErrosValidacao } from "@/modules/usuario/types/errosValidacao";
import { cadastrarPassageiros } from "../services/cadastrarPassageiros";
import type { DadosPassageiro } from "../types/dadosPassageiro";
import type { Reserva } from "../types/reserva";
import { apenasDigitos } from "../utils/formatarReserva";
import { regrasPassageiro } from "../utils/regrasPassageiro";

const PASSAGEIRO_VAZIO: DadosPassageiro = { nome: "", cpf: "", dataNasc: "", celular: "", email: "" };

// Valida as regras de cada passageiro e marca o CPF que já apareceu num passageiro anterior.
function validar(passageiros: DadosPassageiro[]) {
  return passageiros.map((passageiro, indice) => {
    const erros = regrasPassageiro.validar(passageiro);
    const cpf = apenasDigitos(passageiro.cpf);
    const repetido = cpf && passageiros.slice(0, indice).some((anterior) => apenasDigitos(anterior.cpf) === cpf);

    return repetido && !erros.cpf ? { ...erros, cpf: "Este CPF já está em outro passageiro." } : erros;
  });
}

// O backend pede exatamente um passageiro por poltrona da reserva, todos com os dados completos.
export function useDadosPassageiros(reserva: Pick<Reserva, "id" | "totalAssentos">) {
  const { usuario } = useAutenticacao();
  const router = useRouter();
  const [passageiros, setPassageiros] = useState(() => Array<DadosPassageiro>(reserva.totalAssentos).fill(PASSAGEIRO_VAZIO));
  const [erros, setErros] = useState<ErrosValidacao<DadosPassageiro>[]>([]);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // O backend vincula à conta o passageiro que tem o CPF do usuário; o checkbox do comprador segue a mesma regra.
  const indiceDoUsuario = usuario ? passageiros.findIndex((passageiro) => apenasDigitos(passageiro.cpf) === usuario.cpf) : -1;

  function trocarPassageiro(indice: number, dados: DadosPassageiro) {
    setPassageiros((atuais) => atuais.map((passageiro, posicao) => (posicao === indice ? dados : passageiro)));
  }

  function alterarCampo(indice: number, campo: keyof DadosPassageiro, valor: string) {
    trocarPassageiro(indice, { ...passageiros[indice], [campo]: valor });
  }

  // Marcar copia os dados da conta, que continuam editáveis, para o primeiro passageiro ainda vazio
  // (ou o primeiro, se todos já tiverem algo). Desmarcar limpa o passageiro que tem o CPF da conta.
  function marcarComprador(marcado: boolean) {
    if (!usuario) return;

    if (!marcado) {
      if (indiceDoUsuario !== -1) trocarPassageiro(indiceDoUsuario, PASSAGEIRO_VAZIO);
      return;
    }

    const vazio = passageiros.findIndex((passageiro) => Object.values(passageiro).every((valor) => !valor.trim()));
    trocarPassageiro(Math.max(vazio, 0), {
      nome: usuario.nome,
      cpf: usuario.cpf,
      dataNasc: usuario.dataNasc ?? "",
      celular: usuario.celular,
      email: usuario.email,
    });
  }

  async function enviar() {
    const errosLocais = validar(passageiros);
    setErros(errosLocais);
    setErroGeral(null);
    if (errosLocais.some((errosDoPassageiro) => Object.keys(errosDoPassageiro).length)) return;

    setEnviando(true);
    try {
      const errosDoBackend = await cadastrarPassageiros(reserva.id, passageiros);

      if (errosDoBackend) {
        setErros(errosDoBackend);
        setEnviando(false);
        return;
      }

      // O pagamento ainda não existe no backend (issue #23): o checkout pula direto para a confirmação.
      // O botão continua desabilitado até a navegação terminar.
      router.push(`/reservas/${reserva.id}/confirmacao`);
    } catch (motivo) {
      setErroGeral(motivo instanceof Error ? motivo.message : "Não foi possível salvar os passageiros.");
      setEnviando(false);
    }
  }

  return {
    passageiros,
    erros,
    erroGeral,
    enviando,
    podeUsarConta: Boolean(usuario),
    compradorEntrePassageiros: indiceDoUsuario !== -1,
    alterarCampo,
    marcarComprador,
    enviar,
  };
}
