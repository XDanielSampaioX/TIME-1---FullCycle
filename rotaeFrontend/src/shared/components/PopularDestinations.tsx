import { Container } from "./Container";

const destinations = [{ city: "São Paulo", state: "SP", origin: "Curitiba", price: "A partir de R$ 89,90", tone: "home-destination-sao-paulo" }, { city: "Rio de Janeiro", state: "RJ", origin: "São Paulo", price: "A partir de R$ 124,00", tone: "home-destination-rio" }, { city: "Brasília", state: "DF", origin: "Belo Horizonte", price: "A partir de R$ 78,50", tone: "home-destination-bh" }, { city: "Salvador", state: "BA", origin: "Recife", price: "A partir de R$ 142,00", tone: "home-destination-curitiba" }];

export function PopularDestinations() {
    return (
        <section className="home-section home-popular" id="rotas">
            <Container>
                <div className="home-section-heading">
                    <div>
                        <span className="home-eyebrow home-eyebrow-dark">Destinos populares</span>
                        <h2>As rotas mais escolhidas para sair da rotina.</h2>
                    </div>
                    <a href="#buscar">Explorar viagens <span aria-hidden="true">→</span>
                    </a>
                </div>
                <div className="home-destination-grid">{destinations.map((destination) =>
                    <a className={`home-destination-card ${destination.tone}`} href={`/viagens?destino=${destination.city}`} key={destination.city}>
                        <span className="home-destination-state">Saindo de {destination.origin}</span>
                        <span>
                            <strong>{destination.city} ({destination.state})</strong>
                            <small>{destination.price}</small>
                        </span></a>)}
                </div>
            </Container>
        </section>
    );
}
