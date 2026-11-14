import { FormularioLogin } from "../components/FormularioLogin";
import { PainelBoasVindas } from "../components/PainelBoasVindas";

export function LoginPage({ destino }: { destino: string }) {
  return (
    <main className="grid flex-1 grid-rows-[auto_1fr] md:grid-cols-2 md:grid-rows-1">
      <PainelBoasVindas
        selo="Bem-vindo de volta"
        titulo={
          <>
            Sua próxima <span className="block text-(--color-accent-500)">viagem inesquecível</span> continua aqui.
          </>
        }
        texto="Acesse sua conta para rever suas viagens, escolher novos destinos e embarcar com tranquilidade pelo Brasil."
      />
      <section className="grid place-items-center px-4 py-10">
        <div className="grid w-full max-w-sm gap-6">
          <header className="grid gap-1">
            <h1 className="m-0 text-2xl font-extrabold">Entrar na sua conta</h1>
            <p className="m-0 text-sm text-(--color-text-secondary)">
              Bem-vindo de volta! Informe seus dados para continuar
            </p>
          </header>
          <FormularioLogin destino={destino} />
        </div>
      </section>
    </main>
  );
}
