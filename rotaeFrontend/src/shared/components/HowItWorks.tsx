import { Container } from "./Container";

const steps = [["01", "Busque", "Origem, destino e data."], ["02", "Escolha", "Seu horário e seu lugar."], ["03", "Partiu", "Passagem segura no celular."]];

export function HowItWorks() {
    return (<section className="home-how" id="como-funciona">
        <Container>
            <header>
                <span className="home-eyebrow">Viajar ficou simples</span>
                <h2>Você escolhe o destino. A gente cuida do resto.</h2>
            </header>
            <div className="home-steps">{steps.map(([number, title, description]) =>
                <article key={number}>
                    <span>{number}</span>
                    <h3>{title}</h3>
                    <p>{description}</p>
                </article>)}
            </div>
        </Container>
    </section>);
}
