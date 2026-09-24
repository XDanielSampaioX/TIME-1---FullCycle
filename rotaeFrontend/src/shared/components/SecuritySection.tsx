import { Container } from "./Container";

const benefits = [["Pagamento protegido", "Seus dados seguros do início ao fim."], ["Bilhete digital", "Tudo no celular, sem papelada."], ["Viações parceiras", "Empresas selecionadas para você."]];

export function SecuritySection() { return <section className="home-trust" id="seguranca"><Container><span className="home-eyebrow home-eyebrow-dark">Para ir sem preocupação</span><h2>Mais tempo olhando a paisagem. Menos tempo resolvendo detalhes.</h2><div className="home-trust-grid">{benefits.map(([title, description]) => <div key={title}><strong>{title}</strong><span>{description}</span></div>)}</div></Container></section>; }
