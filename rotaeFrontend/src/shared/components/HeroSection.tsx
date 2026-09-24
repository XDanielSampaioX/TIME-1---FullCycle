import Link from "next/link";
import { Button } from "./Button";
import { Container } from "./Container";

export function HeroSection() {
    return (
        <section className="home-hero">
            <Container>
                <nav className="home-nav" aria-label="Navegação principal">
                    <Link className="home-brand" href="/">
                        <span className="home-brand-mark" aria-hidden="true">
                            <svg viewBox="0 0 24 24" role="img">
                                <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3h9A2.5 2.5 0 0 1 19 5.5V17H5V5.5Z" />
                                <path d="M7.5 7h9M7 11h10M8 17v2m8-2v2M7.5 14h.01M16.5 14h.01" />
                            </svg>
                        </span>
                        <span>rotaê</span>
                    </Link>
                    <div className="home-nav-links">
                        <a href="#buscar">Encontrar viagem</a>
                        <a href="#como-funciona">Como funciona</a>
                        <a href="#seguranca">Segurança</a>
                    </div>
                    <Link className="home-nav-action" href="/reservas">Minhas viagens</Link>
                </nav>
                <div className="home-hero-content">
                    <span className="home-eyebrow">✦ &nbsp; Viaje pelo Brasil</span>
                    <h1>Seu próximo<br /><em>lugar favorito</em><br />fica mais perto.</h1>
                    <p>Compare ônibus, encontre o melhor horário e deixe o caminho levar você até onde queria estar.</p>
                </div>
                <form className="home-search-card" action="/viagens" id="buscar">
                    <div className="home-search-fields">
                        <label>⌖ &nbsp; Origem
                            <input name="origem" placeholder="De onde você sai?" />
                        </label>
                        <label>⌖ &nbsp; Destino
                            <input name="destino" placeholder="Para onde você vai?" />
                        </label>
                        <label>▣ &nbsp; Ida
                            <input name="partida" type="date" />
                        </label>
                        <label>♙ &nbsp; Passageiros
                            <select name="passageiros" defaultValue="1">
                                <option value="1">1 passageiro</option>
                                <option value="2">2 passageiros</option>
                                <option value="3">3 passageiros</option>
                                <option value="4">4 passageiros</option>
                            </select>
                        </label>
                        <Button type="submit">⌕ &nbsp; Buscar</Button>
                    </div>
                </form>
            </Container>
        </section>
    );
}
