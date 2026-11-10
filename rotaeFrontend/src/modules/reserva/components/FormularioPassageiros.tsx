"use client";

import { useRef } from "react";
import { CampoFormulario } from "@/modules/usuario/components/CampoFormulario";
import { useFocoPrimeiroErro } from "@/modules/usuario/hooks/useFocoPrimeiroErro";
import { Button } from "@/shared/components/Button";
import { useDadosPassageiros } from "../hooks/useDadosPassageiros";
import type { DadosPassageiro } from "../types/dadosPassageiro";
import type { Reserva } from "../types/reserva";
import { ResumoReserva } from "./ResumoReserva";

// Ordem do Figma: nome na linha inteira; CPF e nascimento; e-mail e celular.
const campos: { nome: keyof DadosPassageiro; titulo: string; tipo: string; placeholder?: string }[] = [
  { nome: "nome", titulo: "Nome completo", tipo: "text" },
  { nome: "cpf", titulo: "CPF", tipo: "text", placeholder: "000.000.000-00" },
  { nome: "dataNasc", titulo: "Data de nascimento", tipo: "date" },
  { nome: "email", titulo: "E-mail", tipo: "email" },
  { nome: "celular", titulo: "Celular", tipo: "tel", placeholder: "(85) 99999-0000" },
];

// O quadro "dados-passageiro" do Figma: um card por passagem e o resumo ao lado, com o botão de enviar.
// O backend não liga o passageiro a uma poltrona, por isso os cards não mostram o assento de cada um.
export function FormularioPassageiros({ reserva }: { reserva: Reserva }) {
  const formulario = useRef<HTMLFormElement>(null);
  const {
    passageiros, erros, erroGeral, enviando, podeUsarConta, compradorEntrePassageiros, alterarCampo, marcarComprador, enviar,
  } = useDadosPassageiros(reserva);

  useFocoPrimeiroErro(formulario, erros);

  return (
    <form
      className="reserva-passageiros"
      ref={formulario}
      noValidate
      onSubmit={(evento) => {
        evento.preventDefault();
        void enviar();
      }}
    >
      <div className="reserva-passageiros-card">
        <header>
          <h1>Dados dos passageiros</h1>
          <p>Preencha os dados de cada passageiro. O comprador não precisa ser um dos passageiros.</p>
        </header>
        {podeUsarConta && (
          <label className="reserva-comprador">
            <input
              type="checkbox"
              checked={compradorEntrePassageiros}
              onChange={(evento) => marcarComprador(evento.target.checked)}
            />
            O comprador é um dos passageiros listados abaixo
          </label>
        )}
        {passageiros.map((passageiro, indice) => (
          <fieldset className="reserva-passageiro" key={indice}>
            <legend>Passageiro {indice + 1}</legend>
            <span aria-hidden="true">Passagem {indice + 1}</span>
            <div className="reserva-passageiro-campos">
              {campos.map((campo) => (
                <CampoFormulario
                  key={campo.nome}
                  nome={`${campo.nome}-${indice + 1}`}
                  titulo={campo.titulo}
                  type={campo.tipo}
                  placeholder={campo.placeholder}
                  autoComplete="off"
                  value={passageiro[campo.nome]}
                  erro={erros[indice]?.[campo.nome]}
                  onChange={(evento) => alterarCampo(indice, campo.nome, evento.target.value)}
                />
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <ResumoReserva reserva={reserva}>
        <Button className="viagem-selecionar" type="submit" disabled={enviando}>
          {enviando ? "Salvando…" : "Confirmar reserva"}
        </Button>
        {erroGeral && <p role="alert">{erroGeral}</p>}
      </ResumoReserva>
    </form>
  );
}
