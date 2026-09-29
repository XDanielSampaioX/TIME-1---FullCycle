import { FormularioCadastroUsuario } from "@/modules/usuario/components/FormularioCadastroUsuario";

export function CadastroUsuarioPage() {
  return (
    <main className="usuario-page">
      <section className="usuario-card">
        <p className="usuario-eyebrow">Rotaê</p>
        <h1>Crie sua conta</h1>
        <p className="usuario-description">
          Cadastre-se para consultar viagens e reservar suas passagens.
        </p>
        <FormularioCadastroUsuario />
      </section>
    </main>
  );
}