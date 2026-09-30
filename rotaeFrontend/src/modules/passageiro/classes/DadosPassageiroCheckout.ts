import type { Passageiro } from "../types/passageiro";

export class DadosPassageiroCheckout {
  constructor(private readonly passageiro: Passageiro) {}

  erros() {
    const erros: Partial<Record<keyof Passageiro, string>> = {};
    const cpf = this.passageiro.cpf.replace(/\D/g, "");
    const celular = this.passageiro.celular.replace(/\D/g, "");

    if (this.passageiro.nome.trim().split(/\s+/).length < 2) erros.nome = "Informe o nome completo.";
    if (!/^\S+@\S+\.\S+$/.test(this.passageiro.email)) erros.email = "Informe um e-mail válido.";
    if (celular.length < 10 || celular.length > 11) erros.celular = "Informe um celular com DDD.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(this.passageiro.dataNasc)) erros.dataNasc = "Informe a data de nascimento.";
    if (cpf.length !== 11) erros.cpf = "Informe um CPF com 11 números.";

    return erros;
  }

  valor() {
    return {
      ...this.passageiro,
      nome: this.passageiro.nome.trim(),
      email: this.passageiro.email.trim().toLowerCase(),
      celular: this.passageiro.celular.replace(/\D/g, ""),
      cpf: this.passageiro.cpf.replace(/\D/g, ""),
    };
  }
}
