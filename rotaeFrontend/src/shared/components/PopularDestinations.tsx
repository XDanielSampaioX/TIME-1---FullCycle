import Link from "next/link";
import { listarResultadosPaginados } from "@/lib/api";
import type { Viagem } from "@/modules/viagem/types/viagem";
import { Container } from "./Container";

export async function PopularDestinations() {
    let viagens: Viagem[] = [];

    try {
        viagens = await listarResultadosPaginados("/api/v1/viagens/", "Não foi possível listar as viagens.");
    } catch {
        viagens = [];
    }

    const destinos = viagens.reduce<Viagem[]>((rotas, viagem) => {
        const rotaExistente = rotas.find((rota) => rota.destino.id === viagem.destino.id);
        if (!rotaExistente || viagem.precoCentavos < rotaExistente.precoCentavos) {
            if (rotaExistente) {
                rotas[rotas.indexOf(rotaExistente)] = viagem;
            } else {
                rotas.push(viagem);
            }
        }
        return rotas;
    }, []).sort((a, b) => a.precoCentavos - b.precoCentavos).slice(0, 4);

    return (
        <section className="home-section home-popular" id="rotas">
            <Container>
                <div className="home-section-heading">
                    <div>
                        <span className="home-eyebrow home-eyebrow-dark">Destinos populares</span>
                        <h2>As rotas mais escolhidas para sair da rotina.</h2>
                    </div>
                    <Link href="/#buscar">Explorar viagens <span aria-hidden="true">→</span></Link>
                </div>
                <div className="home-destination-grid">
                    {destinos.map((viagem, indice) => (
                        <Link className={`home-destination-card ${["home-destination-sao-paulo", "home-destination-rio", "home-destination-bh", "home-destination-curitiba"][indice]}`} href={`/viagens?destino=${encodeURIComponent(viagem.destino.nome)}`} key={viagem.destino.id}>
                            <span className="home-destination-state">Saindo de {viagem.origem.nome}</span>
                            <span>
                                <strong>{viagem.destino.nome} ({viagem.destino.uf})</strong>
                                <small>A partir de {(viagem.precoCentavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</small>
                            </span>
                        </Link>
                    ))}
                </div>
            </Container>
        </section>
    );
}
