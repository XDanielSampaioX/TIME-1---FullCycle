import { GrupoValidacoes } from "./GrupoValidacoes";
import { ValidacaoCampo } from "./ValidacaoCampo";

export function numeros(valor: string): string {
  return valor.replace(/\D/g, "");
}

function cpfValido(valor: string): boolean {
  const cpf = numeros(valor);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  for (const tamanho of [9, 10]) {
    const soma = [...cpf.slice(0, tamanho)].reduce(
      (total, digito, indice) => total + Number(digito) * (tamanho + 1 - indice),
      0,
    );
    const digito = (soma * 10) % 11;
    if (Number(cpf[tamanho]) !== (digito === 10 ? 0 : digito)) return false;
  }
  return true;
}

function dataNascimentoValida(valor: string): boolean {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (!partes) return false;

  const [, ano, mes, dia] = partes;
  const data = new Date(0);
  data.setFullYear(Number(ano), Number(mes) - 1, Number(dia));
  data.setHours(12, 0, 0, 0);
  const hoje = new Date();

  return (
    data.getFullYear() === Number(ano) &&
    data.getMonth() + 1 === Number(mes) &&
    data.getDate() === Number(dia) &&
    data.getTime() <= hoje.getTime()
  );
}

// Composite: cada grupo pode conter regras simples ou mais grupos.
export const validacaoCadastro = new GrupoValidacoes([
  new GrupoValidacoes([
    new ValidacaoCampo("nome", (valor) => valor.trim().length >= 2, "Informe seu nome com pelo menos 2 letras."),
    new ValidacaoCampo("dataNasc", (valor) => dataNascimentoValida(valor), "Informe uma data de nascimento válida, que não seja futura."),
    new ValidacaoCampo("cpf", (valor) => cpfValido(valor), "Informe um CPF válido."),
  ]),
  new GrupoValidacoes([
    new ValidacaoCampo("email", (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim()), "Informe um e-mail válido."),
    new ValidacaoCampo("celular", (valor) => /^\d{10,11}$/.test(numeros(valor)), "Informe um celular com DDD (10 ou 11 números)."),
  ]),
  new ValidacaoCampo("senha", (valor) => valor.length >= 8, "A senha deve ter pelo menos 8 caracteres."),
]);
