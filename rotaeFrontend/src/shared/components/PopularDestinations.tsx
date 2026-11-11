"use client";

import Link from "next/link";
import { useDestinosPopulares } from "@/modules/viagem/hooks/useDestinosPopulares";
import { formatarNomeCidade } from "@/modules/viagem/utils/formatarNomeCidade";
import { formatarValorEmReais } from "@/shared/utils/formatarValorEmReais";
import { Container } from "./Container";

export function PopularDestinations() {
    const destinos = useDestinosPopulares();

    return (
        <section className="home-section home-popular" id="rotas">
            <Container>
                <div className="home-section-heading">
                    <div>
                        <span className="home-eyebrow home-eyebrow-dark">Destinos populares</span>
                        <h2>As rotas mais escolhidas para sair da rotina.</h2>
                    </div>
                    <Link href="/viagens">Explorar viagens <span aria-hidden="true">→</span></Link>
                </div>
                <div className="home-destination-grid">
                    {destinos.map((viagem, indice) => (
                        <Link className={`home-destination-card ${["home-destination-sao-paulo", "home-destination-rio", "home-destination-bh", "home-destination-curitiba"][indice]}`} href={`/viagens?destino=${encodeURIComponent(viagem.destino.nome)}`} key={viagem.destino.id}>
                            <span className="home-destination-state">Saindo de {viagem.origem.nome}</span>
                            <span>
                                <strong>{formatarNomeCidade(viagem.destino)}</strong>
                                <small>A partir de {formatarValorEmReais(viagem.precoCentavos)}</small>
                            </span>
                        </Link>
                    ))}
                </div>
            </Container>
        </section>
    );
}
