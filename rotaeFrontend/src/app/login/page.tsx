import Link from "next/link";
import { FormularioLogin } from "@/modules/autenticacao/components/FormularioLogin";

function destinoSeguro(valor: unknown): string {
  return typeof valor === "string" && valor.startsWith("/") && !valor.startsWith("//") && !valor.includes("\\")
    ? valor
    : "/minha-conta";
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const parametros = await searchParams;
  return (
    <main className="usuario-page">
      <section className="usuario-card">
        <p className="usuario-eyebrow">Rotaê</p>
        <h1>Entre na sua conta</h1>
        <p className="usuario-description">Acesse seus dados para continuar sua viagem.</p>
        <FormularioLogin destino={destinoSeguro(parametros.next)} />
        <p className="usuario-link">Ainda não tem uma conta? <Link href="/cadastro">Cadastre-se</Link></p>
      </section>
    </main>
  );
}
