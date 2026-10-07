import { Button } from "./Button";
import { Container } from "./Container";

export function HeroSection() {
    return (
        <section className="home-hero">
            <Container>
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
                        <label>♙ &nbsp; Passageiros (opcional)
                            <select name="passageiros" defaultValue="">
                                <option value="">Definir na seleção de assentos</option>
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
