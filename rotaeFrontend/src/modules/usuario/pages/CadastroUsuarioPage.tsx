import { Container } from "@/shared/components/Container";
import { FormularioCadastroUsuario } from "../components/FormularioCadastroUsuario";

export function CadastroUsuarioPage() {
  return (
    <main className="flex-1 py-12">
      <Container className="max-w-md">
        <section className={`
          grid gap-6 rounded-(--radius-lg) bg-(--color-surface-card)
          p-6 shadow-(--shadow-card)
        `}>
          <h1 className="m-0 text-2xl font-extrabold">
            Criar conta
          </h1>
          <FormularioCadastroUsuario />
        </section>
      </Container>
    </main>
  );
}
