"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/shared/components/Button";
import { EtapasCheckout } from "@/modules/reserva/components/EtapasCheckout";
import { ResumoCheckout } from "@/modules/reserva/components/ResumoCheckout";
import { useSessaoCheckout } from "@/modules/reserva/hooks/useSessaoCheckout";
import { useViagem } from "@/modules/viagem/hooks/useViagem";
import type { Passageiro } from "../types/passageiro";
import { DadosPassageiroCheckout } from "../classes/DadosPassageiroCheckout";
import "@/modules/reserva/pages/checkout.css";

const PASSAGEIRO_VAZIO: Passageiro = { nome: "", email: "", celular: "", dataNasc: "", cpf: "" };

export function DadosPassageirosPage({ viagemId }: { viagemId: number }) {
  const router = useRouter();
  const { sessao, carregando: carregandoSessao, atualizar } = useSessaoCheckout(viagemId);
  const { viagens, cidades, carregando, erro } = useViagem();

  const viagem = viagens.find((item) => item.id === viagemId);
  const origem = cidades.find((item) => item.id === viagem?.origemId);
  const destino = cidades.find((item) => item.id === viagem?.destinoId);
  const resultado = viagem && origem && destino ? { viagem, origem, destino, assentosLivres: 0 } : null;

  if (carregando || carregandoSessao) return <main className="checkout-page"><p className="checkout-estado">Carregando checkout…</p></main>;
  if (erro) return <main className="checkout-page"><p className="checkout-estado" role="alert">{erro}</p></main>;
  if (!sessao || !resultado) {
    return (
      <main className="checkout-page">
        <div className="checkout-estado">
          <h1>Seleção não encontrada</h1>
          <p>Escolha seus assentos antes de informar os passageiros.</p>
          <Link href={`/viagens/${viagemId}/assentos`}>Voltar à seleção de assentos</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <EtapasCheckout atual={2} />
      <FormularioPassageiros viagemId={viagemId} sessao={sessao} resultado={resultado} atualizar={atualizar} avancar={() => router.push(`/viagens/${viagemId}/pagamento`)} />
    </main>
  );
}

function FormularioPassageiros({ viagemId, sessao, resultado, atualizar, avancar }: {
  viagemId: number;
  sessao: NonNullable<ReturnType<typeof useSessaoCheckout>["sessao"]>;
  resultado: NonNullable<Parameters<typeof ResumoCheckout>[0]["resultado"]>;
  atualizar: ReturnType<typeof useSessaoCheckout>["atualizar"];
  avancar: () => void;
}) {
  const [passageiros, setPassageiros] = useState<Passageiro[]>(() => sessao.assentoIds.map((_, indice) => sessao.passageiros[indice] ?? { ...PASSAGEIRO_VAZIO }));
  const [erros, setErros] = useState<Array<Partial<Record<keyof Passageiro, string>>>>([]);

  function alterar(indice: number, campo: keyof Passageiro, valor: string) {
    setPassageiros((atuais) => atuais.map((passageiro, atual) => atual === indice ? { ...passageiro, [campo]: valor } : passageiro));
  }

  function continuar(evento: FormEvent) {
    evento.preventDefault();
    const dados = passageiros.map((passageiro) => new DadosPassageiroCheckout(passageiro));
    const proximosErros = dados.map((item) => item.erros());
    setErros(proximosErros);

    if (proximosErros.some((item) => Object.keys(item).length > 0)) return;

    atualizar({ ...sessao, passageiros: dados.map((item) => item.valor()) });
    avancar();
  }

  return (
      <div className="checkout-layout">
        <form className="checkout-card" onSubmit={continuar} noValidate>
          <header>
            <h1>Dados dos passageiros</h1>
            <p>Preencha os dados de cada passageiro conforme o assento selecionado. O comprador não precisa ser um dos passageiros.</p>
          </header>
          <div className="checkout-passageiros">
            {passageiros.map((passageiro, indice) => (
              <fieldset className="checkout-passageiro" key={sessao.assentoIds[indice]}>
                <legend>
                  <span>Assento {sessao.numerosAssentos[indice]}</span>
                  Passageiro {indice + 1}
                </legend>
                <label className="checkout-campo checkout-campo-largo">
                  Nome completo
                  <input value={passageiro.nome} onChange={(evento) => alterar(indice, "nome", evento.target.value)} aria-invalid={Boolean(erros[indice]?.nome)} />
                  {erros[indice]?.nome && <small role="alert">{erros[indice].nome}</small>}
                </label>
                <label className="checkout-campo">
                  CPF
                  <input inputMode="numeric" value={passageiro.cpf} onChange={(evento) => alterar(indice, "cpf", evento.target.value)} aria-invalid={Boolean(erros[indice]?.cpf)} />
                  {erros[indice]?.cpf && <small role="alert">{erros[indice].cpf}</small>}
                </label>
                <label className="checkout-campo">
                  Data de nascimento
                  <input type="date" value={passageiro.dataNasc} onChange={(evento) => alterar(indice, "dataNasc", evento.target.value)} aria-invalid={Boolean(erros[indice]?.dataNasc)} />
                  {erros[indice]?.dataNasc && <small role="alert">{erros[indice].dataNasc}</small>}
                </label>
                <label className="checkout-campo">
                  E-mail
                  <input type="email" value={passageiro.email} onChange={(evento) => alterar(indice, "email", evento.target.value)} aria-invalid={Boolean(erros[indice]?.email)} />
                  {erros[indice]?.email && <small role="alert">{erros[indice].email}</small>}
                </label>
                <label className="checkout-campo">
                  Celular
                  <input inputMode="tel" value={passageiro.celular} onChange={(evento) => alterar(indice, "celular", evento.target.value)} aria-invalid={Boolean(erros[indice]?.celular)} />
                  {erros[indice]?.celular && <small role="alert">{erros[indice].celular}</small>}
                </label>
              </fieldset>
            ))}
          </div>
          <div className="checkout-acoes">
            <Link href={`/viagens/${viagemId}/assentos`}>← Voltar</Link>
            <Button type="submit">Continuar para pagamento →</Button>
          </div>
        </form>
        <ResumoCheckout sessao={sessao} resultado={resultado} />
      </div>
  );
}
