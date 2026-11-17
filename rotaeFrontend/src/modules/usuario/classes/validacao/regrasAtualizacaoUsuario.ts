import type { AtualizacaoUsuario } from "../../types/atualizacaoUsuario";
import { GrupoRegrasValidacao } from "./GrupoRegrasValidacao";
import { regrasDadosPessoais } from "./regrasDadosPessoais";
import { regrasEmail } from "./regrasEmail";

// Checagens rápidas antes do envio. As regras definitivas (e-mail já usado, data futura)
// são do backend, que devolve a mensagem de cada campo.
// Para validar algo novo, crie uma classe que estenda RegraValidacao e adicione-a aqui.
export const regrasAtualizacaoUsuario = new GrupoRegrasValidacao<AtualizacaoUsuario>([
  regrasDadosPessoais<AtualizacaoUsuario>(),
  regrasEmail<AtualizacaoUsuario>(),
]);
