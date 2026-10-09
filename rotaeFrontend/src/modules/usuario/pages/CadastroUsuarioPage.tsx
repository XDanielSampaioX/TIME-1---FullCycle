import { FormularioCadastroUsuario } from "@/modules/usuario/components/FormularioCadastroUsuario";
import { UsuarioProvider } from "@/modules/usuario/contexts/UsuarioContext";
import Link from "next/link";

export function CadastroUsuarioPage() {
  return (
    <UsuarioProvider>
      <main className="usuario-page">
        <section className="usuario-card">
          <p className="usuario-eyebrow">Rotaê</p>
          <h1>Crie sua conta</h1>
          <p className="usuario-description">
            Cadastre-se para consultar viagens e reservar suas passagens.
          </p>
          <FormularioCadastroUsuario />
          <p className="usuario-link">Já tem conta? <Link href="/login">Entre aqui</Link></p>
        </section>
      </main>
    </UsuarioProvider>
  );
}
