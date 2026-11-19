// Máscaras no padrão brasileiro, aplicadas enquanto a pessoa digita. Funções puras: sem estado e sem React.
// O backend guarda CPF e celular só com números; as regras de validação aceitam o valor com ou sem máscara.

// Exemplo: 123.456.789-09 vira 12345678909.
export function apenasDigitos(valor: string) {
  return valor.replace(/\D/g, "");
}

// Exemplo: 12345678909 vira 123.456.789-09. Funciona com o valor pela metade e com texto colado.
export function mascararCpf(valor: string) {
  return apenasDigitos(valor).slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

// Celular começa com 9 e tem 11 dígitos: (85) 99999-0000. Fixo tem 10: (85) 3333-4444.
// Separar os dois evita o hífen "pular" de lugar ao apagar.
export function mascararCelular(valor: string) {
  const todos = apenasDigitos(valor);
  const celular = todos[2] === "9";
  const comDdd = todos.slice(0, celular ? 11 : 10).replace(/^(\d{2})(\d)/, "($1) $2");

  return celular
    ? comDdd.replace(/(\d{5})(\d{1,4})$/, "$1-$2")
    : comDdd.replace(/(\d{4})(\d{1,4})$/, "$1-$2");
}

const MASCARAS: Record<string, (valor: string) => string> = { cpf: mascararCpf, celular: mascararCelular };

// Para o alterarCampo dos formulários: CPF e celular passam pela máscara; os outros campos ficam como estão.
export function mascararCampo(campo: string, valor: string) {
  return MASCARAS[campo]?.(valor) ?? valor;
}
