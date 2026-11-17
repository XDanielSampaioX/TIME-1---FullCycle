import { apiUrl } from "@/lib/api";
import { fetchAutenticado } from "@/modules/autenticacao/services/fetchAutenticado";
import type { ErrosValidacao } from "@/modules/usuario/types/errosValidacao";
import type { DadosPassageiro } from "../types/dadosPassageiro";
import { apenasDigitos } from "../utils/formatarReserva";

type MensagensPorCampo = Record<string, string[]>;

// O backend recusa de dois jeitos: campo a campo, numa chave com a posição do passageiro na
// lista enviada ({ "1": { "cpf": ["CPF inválido."] } }, só os que têm problema), ou com uma
// mensagem para a requisição inteira (detail / nonFieldErrors).
type CorpoDoErro = {
  [posicao: `${number}`]: MensagensPorCampo;
  detail?: string;
  nonFieldErrors?: string[];
};

// Casa cada recusa com o passageiro na mesma posição do envio. A tela mostra uma mensagem por
// campo, então as demais do campo são descartadas. Devolve null se não houver recusa de campo.
function lerErrosPorPassageiro(corpo: CorpoDoErro | null, total: number) {
  const erros: ErrosValidacao<DadosPassageiro>[] = Array.from({ length: total }, () => ({}));
  let recusou = false;

  for (let posicao = 0; posicao < total; posicao += 1) {
    const mensagens = corpo?.[`${posicao}`];
    if (!mensagens) continue;

    recusou = true;
    erros[posicao] = Object.fromEntries(
      Object.entries(mensagens).map(([campo, lista]) => [campo, lista[0]]),
    );
  }

  return recusou ? erros : null;
}

// Envia um passageiro por poltrona. Devolve null quando dá certo ou, se algum campo for
// recusado, os erros de cada passageiro na mesma ordem do envio.
export async function cadastrarPassageiros(
  reservaId: number,
  passageiros: DadosPassageiro[],
): Promise<ErrosValidacao<DadosPassageiro>[] | null> {
  const resposta = await fetchAutenticado(apiUrl(`/api/v1/reservas/${reservaId}/passageiros/`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(passageiros.map((passageiro) => ({
      ...passageiro,
      cpf: apenasDigitos(passageiro.cpf),
      celular: apenasDigitos(passageiro.celular),
    }))),
  });

  if (resposta.ok) return null;

  const corpo = await resposta.json().catch(() => null) as CorpoDoErro | null;
  const erros = lerErrosPorPassageiro(corpo, passageiros.length);

  if (erros) return erros;

  // 409 (reserva expirada, paga ou já preenchida), 404 e as recusas da lista inteira (quantidade, CPF repetido).
  throw new Error(corpo?.detail ?? corpo?.nonFieldErrors?.[0] ?? "Não foi possível salvar os passageiros.");
}
